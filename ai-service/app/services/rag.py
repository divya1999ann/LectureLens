"""RAG service using LangGraph for orchestration"""
from typing import List, Dict, Any, TypedDict
from langgraph.graph import StateGraph, END
from app.services.embeddings import EmbeddingService
from app.services.vector_store import VectorStoreService
from app.config import get_settings
from openrouter import OpenRouter
import logging

logger = logging.getLogger(__name__)
settings = get_settings()


class RAGState(TypedDict):
    """State for RAG pipeline"""
    question: str
    lecture_ids: List[str]
    chat_history: List[Dict[str, str]]
    query_embedding: List[float]
    retrieved_chunks: List[Dict[str, Any]]
    context: str
    answer: str
    citations: List[Dict[str, Any]]
    has_relevant_info: bool


class RAGService:
    """RAG service using LangGraph orchestration"""
    
    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.vector_store = VectorStoreService()
        self.llm_client = OpenRouter(api_key=settings.openrouter_api_key)
        self.graph = self._build_graph()
    
    def _build_graph(self) -> StateGraph:
        """Build LangGraph workflow"""
        workflow = StateGraph(RAGState)
        
        # Define nodes
        workflow.add_node("embed_query", self._embed_query)
        workflow.add_node("retrieve_chunks", self._retrieve_chunks)
        workflow.add_node("check_relevance", self._check_relevance)
        workflow.add_node("build_context", self._build_context)
        workflow.add_node("generate_answer", self._generate_answer)
        workflow.add_node("fallback_answer", self._fallback_answer)
        
        # Define edges
        workflow.set_entry_point("embed_query")
        workflow.add_edge("embed_query", "retrieve_chunks")
        workflow.add_edge("retrieve_chunks", "check_relevance")
        
        # Conditional edge based on relevance
        workflow.add_conditional_edges(
            "check_relevance",
            lambda state: "has_info" if state["has_relevant_info"] else "no_info",
            {
                "has_info": "build_context",
                "no_info": "fallback_answer"
            }
        )
        
        workflow.add_edge("build_context", "generate_answer")
        workflow.add_edge("generate_answer", END)
        workflow.add_edge("fallback_answer", END)
        
        return workflow.compile()
    
    def _embed_query(self, state: RAGState) -> RAGState:
        """Node 1: Embed the user query"""
        logger.info("Embedding user query...")
        embedding = self.embedding_service.embed_text(state["question"])
        state["query_embedding"] = embedding
        return state
    
    def _retrieve_chunks(self, state: RAGState) -> RAGState:
        """Node 2: Retrieve relevant chunks from Pinecone"""
        print(f"→ Retrieving chunks from {len(state['lecture_ids'])} lectures...")
        print(f"  Lecture IDs: {state['lecture_ids']}")
        logger.info(f"Retrieving chunks from {len(state['lecture_ids'])} lectures...")
        logger.info(f"Lecture IDs: {state['lecture_ids']}")

        chunks = self.vector_store.query_lectures(
            query_embedding=state["query_embedding"],
            lecture_ids=state["lecture_ids"],
            top_k=5  # Top 5 per lecture
        )

        state["retrieved_chunks"] = chunks
        print(f"✓ Retrieved {len(chunks)} chunks")
        logger.info(f"Retrieved {len(chunks)} chunks")
        if chunks:
            print(f"  Scores: {[c['score'] for c in chunks[:3]]}")
            logger.info(f"Chunk scores: {[c['score'] for c in chunks[:3]]}")
        return state
    
    def _check_relevance(self, state: RAGState) -> RAGState:
        """Node 3: Check if retrieved chunks are relevant (score threshold)"""
        # Check if we have chunks with good relevance scores
        relevant_chunks = [
            chunk for chunk in state["retrieved_chunks"]
            if chunk["score"] > 0.1  # Similarity threshold (lowered for this embedding model)
        ]

        print(f"→ Checking relevance (threshold=0.35)...")
        print(f"  Total chunks: {len(state['retrieved_chunks'])}")
        print(f"  Relevant chunks (score > 0.35): {len(relevant_chunks)}")
        if state["retrieved_chunks"]:
            print(f"  Max score: {max(c['score'] for c in state['retrieved_chunks'])}")

        state["has_relevant_info"] = len(relevant_chunks) > 0

        if state["has_relevant_info"]:
            state["retrieved_chunks"] = relevant_chunks
            print(f"✓ Found {len(relevant_chunks)} relevant chunks - using RAG")
            logger.info(f"Found {len(relevant_chunks)} relevant chunks")
        else:
            print(f"✗ No relevant chunks found (scores too low) - using FALLBACK")
            logger.info("No highly relevant chunks found")

        return state
    
    def _build_context(self, state: RAGState) -> RAGState:
        """Node 4: Build context from retrieved chunks"""
        logger.info("Building context from chunks...")
        
        # Group chunks by lecture for better organization
        chunks_by_lecture = {}
        for chunk in state["retrieved_chunks"]:
            lecture_id = chunk["lecture_id"]
            if lecture_id not in chunks_by_lecture:
                chunks_by_lecture[lecture_id] = []
            chunks_by_lecture[lecture_id].append(chunk)
        
        # Build context string
        context_parts = []
        citations = []
        
        for lecture_id, chunks in chunks_by_lecture.items():
            context_parts.append(f"\n--- From Lecture {lecture_id} ---")
            for chunk in chunks[:3]:  # Top 3 chunks per lecture
                context_parts.append(chunk["chunk_text"])
                
                # Prepare citation
                citations.append({
                    "lecture_id": lecture_id,
                    "chunk_text": chunk["chunk_text"][:200] + "...",
                    "relevance_score": chunk["score"]
                })
        
        state["context"] = "\n\n".join(context_parts)
        state["citations"] = citations
        return state
    
    def _generate_answer(self, state: RAGState) -> RAGState:
        """Node 5: Generate answer using LLM with context"""
        logger.info("Generating answer with LLM...")
        
        # Build chat history for context
        history_context = ""
        if state["chat_history"]:
            history_context = "\nPrevious conversation:\n"
            for msg in state["chat_history"][-4:]:  # Last 4 messages
                role = "Student" if msg["role"] == "user" else "Assistant"
                history_context += f"{role}: {msg['content']}\n"
        
        # System prompt
        system_prompt = """You are a helpful teaching assistant for students. 
Your role is to help students understand lecture content by answering their questions based on the lecture transcripts provided.

Guidelines:
- Answer questions accurately based on the lecture content
- Be clear, concise, and educational
- If you reference specific concepts, mention which lecture they're from
- Use simple language that students can understand
- If the question requires explanation, provide examples
- Be encouraging and supportive

When answering:
1. Base your answer primarily on the lecture content provided
2. Mention the lecture number when referencing specific information (e.g., "In Lecture 5, the professor explained...")
3. If multiple lectures cover the topic, synthesize the information
4. Keep your answer focused and relevant to the question"""

        # User prompt with context
        user_prompt = f"""{history_context}

Lecture Content:
{state["context"]}

Student Question: {state["question"]}

Please answer the student's question based on the lecture content above. Remember to mention which lecture(s) the information comes from."""

        # Call LLM
        try:
            response = self.llm_client.chat.send(
                model=settings.llm_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            state["answer"] = response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Error generating answer: {e}")
            state["answer"] = "I encountered an error while generating the answer. Please try again."
        
        return state
    
    def _fallback_answer(self, state: RAGState) -> RAGState:
        """Node 6: Fallback when no relevant info found in lectures"""
        logger.info("Using fallback - no relevant lecture content found")
        
        # Build chat history
        history_context = ""
        if state["chat_history"]:
            history_context = "\nPrevious conversation:\n"
            for msg in state["chat_history"][-4:]:
                role = "Student" if msg["role"] == "user" else "Assistant"
                history_context += f"{role}: {msg['content']}\n"
        
        system_prompt = """You are a helpful teaching assistant. 
The student has asked a question, but there is no directly relevant information in the selected lecture transcripts.

Your task:
1. First, acknowledge that the information is not covered in the selected lectures
2. Then, provide a helpful answer based on your general knowledge
3. Be educational and clear
4. Suggest that the student might want to check other lectures or resources"""

        user_prompt = f"""{history_context}

Student Question: {state["question"]}

The selected lectures do not contain specific information about this question.
Please provide a helpful response following the guidelines above."""

        try:
            response = self.llm_client.chat.send(
                model=settings.llm_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            state["answer"] = response.choices[0].message.content
            state["citations"] = []
            
        except Exception as e:
            logger.error(f"Error in fallback: {e}")
            state["answer"] = "I couldn't find relevant information in the selected lectures. Please try selecting different lectures or rephrase your question."
        
        return state
    
    async def query(
        self,
        question: str,
        lecture_ids: List[str],
        chat_history: List[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Execute RAG query
        
        Args:
            question: User's question
            lecture_ids: List of lecture IDs to query
            chat_history: Previous conversation messages
            
        Returns:
            Dictionary with answer and citations
        """
        # Initialize state
        initial_state: RAGState = {
            "question": question,
            "lecture_ids": lecture_ids,
            "chat_history": chat_history or [],
            "query_embedding": [],
            "retrieved_chunks": [],
            "context": "",
            "answer": "",
            "citations": [],
            "has_relevant_info": False
        }
        
        # Run the graph
        final_state = self.graph.invoke(initial_state)
        
        return {
            "answer": final_state["answer"],
            "citations": final_state["citations"],
            "lecture_ids_used": lecture_ids
        }
