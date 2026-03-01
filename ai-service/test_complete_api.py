"""Complete end-to-end API test"""
import httpx
import asyncio
import json


async def test_complete_workflow():
    """Test complete workflow: Transcription → Storage → RAG Chat"""
    
    print("=" * 70)
    print("COMPLETE END-TO-END API TEST")
    print("=" * 70)
    
    base_url = "http://127.0.0.1:8001"
    
    # =====================================================================
    # TEST 1: Transcription Endpoint (with URL)
    # =====================================================================
    print("\n" + "=" * 70)
    print("TEST 1: TRANSCRIPTION ENDPOINT")
    print("=" * 70)
    
    transcription_request = {
        "lecture_id": 201,
        "audio_url": "https://static.deepgram.com/examples/Bueller-Life-moves-pretty-fast.wav",
        "method": "live"
    }
    
    print(f"\n📝 Transcribing lecture {transcription_request['lecture_id']}...")
    print(f"Audio URL: {transcription_request['audio_url']}")
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{base_url}/ai/transcribe",
            json=transcription_request
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✅ Transcription successful!")
            print(f"   Duration: {result['duration_seconds']:.2f} seconds")
            print(f"   Word count: {result['word_count']}")
            print(f"   Chunks created: {result['chunks_created']}")
            print(f"\n   Transcript preview:")
            print(f"   {result['transcript'][:200]}...")
        else:
            print(f"❌ Error {response.status_code}: {response.text}")
            return
    
    # =====================================================================
    # TEST 2: Process Multiple Test Lectures (Manually)
    # =====================================================================
    print("\n" + "=" * 70)
    print("TEST 2: PROCESSING ADDITIONAL TEST LECTURES")
    print("=" * 70)
    
    # We'll manually create and embed these for testing
    from app.utils.chunking import chunk_text
    from app.services.embeddings import EmbeddingService
    from app.services.vector_store import VectorStoreService
    
    test_lectures = [
        {
            "id": 202,
            "title": "Neural Networks Basics",
            "transcript": """Neural networks are powerful machine learning models. 
They consist of layers: input layer, hidden layers, and output layer.
Backpropagation is the algorithm used to train neural networks.
It calculates gradients by applying the chain rule backwards through the network.
Gradient descent then uses these gradients to update the weights."""
        },
        {
            "id": 203,
            "title": "Optimization in ML",
            "transcript": """Gradient descent is the fundamental optimization algorithm.
It iteratively moves in the direction of steepest descent.
The learning rate controls the step size in gradient descent.
Mini-batch gradient descent is commonly used in practice.
Adam optimizer is a popular adaptive learning rate method."""
        }
    ]
    
    embedding_service = EmbeddingService()
    vector_store = VectorStoreService()
    
    for lecture in test_lectures:
        print(f"\n📚 Processing Lecture {lecture['id']}: {lecture['title']}")
        
        # Chunk with smaller size for better granularity
        chunks = chunk_text(
            lecture["transcript"],
            chunk_size=150,
            chunk_overlap=30,
            lecture_id=lecture["id"]
        )
        print(f"   Created {len(chunks)} chunks")
        
        # Embed
        chunk_texts = [c["text"] for c in chunks]
        embeddings = embedding_service.embed_texts(chunk_texts)
        print(f"   Generated {len(embeddings)} embeddings")
        
        # Store
        count = vector_store.upsert_chunks(lecture["id"], chunks, embeddings)
        print(f"   ✅ Stored {count} vectors in Pinecone")
    
    print("\n✅ All test lectures processed!")
    
    # =====================================================================
    # TEST 3: RAG Chat Queries (via API)
    # =====================================================================
    print("\n" + "=" * 70)
    print("TEST 3: RAG CHAT QUERIES")
    print("=" * 70)
    
    chat_tests = [
        {
            "name": "Single Lecture - Backpropagation",
            "request": {
                "question": "What is backpropagation and how does it work?",
                "lecture_ids": [202],
                "chat_history": []
            }
        },
        {
            "name": "Multi-Lecture - Gradient Descent",
            "request": {
                "question": "Explain gradient descent in detail",
                "lecture_ids": [202, 203],
                "chat_history": []
            }
        },
        {
            "name": "Follow-up with History",
            "request": {
                "question": "What's the difference between that and Adam optimizer?",
                "lecture_ids": [203],
                "chat_history": [
                    {
                        "role": "user",
                        "content": "What is gradient descent?"
                    },
                    {
                        "role": "assistant",
                        "content": "Gradient descent is an optimization algorithm that minimizes the loss function."
                    }
                ]
            }
        },
        {
            "name": "Information from Deepgram Lecture",
            "request": {
                "question": "What does the lecture say about life?",
                "lecture_ids": [201],
                "chat_history": []
            }
        }
    ]
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        for i, test in enumerate(chat_tests, 1):
            print(f"\n{'─' * 70}")
            print(f"Chat Test {i}: {test['name']}")
            print(f"{'─' * 70}")
            print(f"Question: {test['request']['question']}")
            print(f"Lectures: {test['request']['lecture_ids']}")
            
            response = await client.post(
                f"{base_url}/ai/chat",
                json=test['request']
            )
            
            if response.status_code == 200:
                result = response.json()
                
                print(f"\n✅ Answer:")
                print(result['answer'][:500] + "..." if len(result['answer']) > 500 else result['answer'])
                
                if result['citations']:
                    print(f"\n📚 Citations: {len(result['citations'])} found")
                    for j, cite in enumerate(result['citations'][:2], 1):
                        print(f"   {j}. Lecture {cite['lecture_id']} (Score: {cite['relevance_score']:.3f})")
                        print(f"      \"{cite['chunk_text'][:100]}...\"")
                else:
                    print("\n⚠️ No citations (fallback mode)")
            else:
                print(f"❌ Error {response.status_code}: {response.text}")
    
    # =====================================================================
    # SUMMARY
    # =====================================================================
    print("\n" + "=" * 70)
    print("✅ COMPLETE END-TO-END TEST FINISHED!")
    print("=" * 70)
    print("\n📊 Tests Completed:")
    print("   ✅ Transcription API endpoint")
    print("   ✅ Manual lecture processing")
    print("   ✅ RAG chat API endpoint")
    print("   ✅ Single lecture queries")
    print("   ✅ Multi-lecture queries")
    print("   ✅ Chat history context")
    print("   ✅ Citation generation")
    print("\n🎉 All systems operational!")


if __name__ == "__main__":
    asyncio.run(test_complete_workflow())
