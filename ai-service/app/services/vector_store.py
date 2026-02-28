"""Vector storage service using Pinecone"""
from typing import List, Dict, Any
from pinecone import Pinecone, ServerlessSpec
from app.config import get_settings
import logging

logger = logging.getLogger(__name__)
settings = get_settings()


class VectorStoreService:
    """Service for managing vectors in Pinecone"""
    
    def __init__(self):
        self.pc = Pinecone(api_key=settings.pinecone_api_key)
        self.index_name = settings.pinecone_index_name
        self.dimension = settings.embedding_dimension
        self._ensure_index_exists()
        
    def _ensure_index_exists(self):
        """Create index if it doesn't exist"""
        try:
            existing_indexes = [idx.get('name', str(idx)) for idx in self.pc.list_indexes()]
            
            if self.index_name not in existing_indexes:
                logger.info(f"Creating Pinecone index: {self.index_name}")
                self.pc.create_index(
                    name=self.index_name,
                    dimension=self.dimension,
                    metric="cosine",
                    spec=ServerlessSpec(
                        cloud="aws",
                        region=settings.pinecone_environment
                    )
                )
                logger.info(f"Index {self.index_name} created successfully")
            else:
                logger.info(f"Index {self.index_name} already exists")
                
        except Exception as e:
            logger.error(f"Error ensuring index exists: {e}")
            raise
    
    def upsert_chunks(
        self,
        lecture_id: int,
        chunks: List[Dict[str, Any]],
        embeddings: List[List[float]]
    ) -> int:
        """
        Store lecture chunks with embeddings in Pinecone
        
        Args:
            lecture_id: ID of the lecture
            chunks: List of chunk dictionaries from chunking utility
            embeddings: List of embedding vectors
            
        Returns:
            Number of vectors upserted
        """
        try:
            index = self.pc.Index(self.index_name)
            namespace = f"lecture_{lecture_id}"
            
            # Prepare vectors for upsert
            vectors = []
            for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                vector_id = f"lecture_{lecture_id}_chunk_{chunk['chunk_index']}"
                
                metadata = {
                    "lecture_id": lecture_id,
                    "chunk_index": chunk['chunk_index'],
                    "text": chunk['text'],
                    "token_count": chunk['token_count']
                }
                
                vectors.append({
                    "id": vector_id,
                    "values": embedding,
                    "metadata": metadata
                })
            
            # Upsert in batches of 100
            batch_size = 100
            total_upserted = 0
            
            for i in range(0, len(vectors), batch_size):
                batch = vectors[i:i + batch_size]
                index.upsert(vectors=batch, namespace=namespace)
                total_upserted += len(batch)
            
            logger.info(f"Upserted {total_upserted} vectors for lecture {lecture_id}")
            return total_upserted
            
        except Exception as e:
            logger.error(f"Error upserting chunks: {e}")
            raise
    
    def query_lectures(
        self,
        query_embedding: List[float],
        lecture_ids: List[int],
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Query vectors across multiple lecture namespaces
        
        Args:
            query_embedding: Embedding vector for the query
            lecture_ids: List of lecture IDs to search
            top_k: Number of results per lecture
            
        Returns:
            List of matches with metadata and scores
        """
        try:
            index = self.pc.Index(self.index_name)
            all_results = []
            
            for lecture_id in lecture_ids:
                namespace = f"lecture_{lecture_id}"
                
                results = index.query(
                    vector=query_embedding,
                    top_k=top_k,
                    namespace=namespace,
                    include_metadata=True
                )
                
                for match in results.matches:
                    all_results.append({
                        "lecture_id": lecture_id,
                        "chunk_text": match.metadata.get("text", ""),
                        "chunk_index": match.metadata.get("chunk_index", 0),
                        "score": match.score
                    })
            
            # Sort by score descending
            all_results.sort(key=lambda x: x['score'], reverse=True)
            
            return all_results[:top_k * len(lecture_ids)]
            
        except Exception as e:
            logger.error(f"Error querying lectures: {e}")
            raise
    
    def delete_lecture(self, lecture_id: int) -> bool:
        """
        Delete all vectors for a lecture
        
        Args:
            lecture_id: ID of the lecture to delete
            
        Returns:
            True if successful
        """
        try:
            index = self.pc.Index(self.index_name)
            namespace = f"lecture_{lecture_id}"
            
            # Delete entire namespace
            index.delete(delete_all=True, namespace=namespace)
            
            logger.info(f"Deleted vectors for lecture {lecture_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting lecture: {e}")
            raise
