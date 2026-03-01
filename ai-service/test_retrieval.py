"""Test if retrieval is finding relevant chunks"""
import asyncio
from app.services.embeddings import EmbeddingService
from app.services.vector_store import VectorStoreService

async def test_retrieval():
    print("Testing retrieval from Pinecone...\n")
    
    embedding_service = EmbeddingService()
    vector_store = VectorStoreService()
    
    # Test queries
    test_cases = [
        ("What is backpropagation?", [101]),
        ("Explain gradient descent", [102]),
        ("Tell me about GANs", [103])
    ]
    
    for question, lecture_ids in test_cases:
        print(f"Question: {question}")
        print(f"Searching lectures: {lecture_ids}")
        
        # Embed question
        query_embedding = embedding_service.embed_text(question)
        
        # Query Pinecone
        results = vector_store.query_lectures(
            query_embedding=query_embedding,
            lecture_ids=lecture_ids,
            top_k=3
        )
        
        print(f"Found {len(results)} chunks:")
        for i, result in enumerate(results[:2], 1):
            print(f"  {i}. Score: {result['score']:.3f}")
            print(f"     {result['chunk_text'][:150]}...")
        print()

if __name__ == "__main__":
    asyncio.run(test_retrieval())
