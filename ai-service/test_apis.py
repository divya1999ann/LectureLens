"""Test script to verify all API connections"""
import os
from dotenv import load_dotenv

load_dotenv()

print("=" * 60)
print("TESTING API CONNECTIONS")
print("=" * 60)

# Test 1: OpenRouter (LLM)
print("\n1️⃣ Testing OpenRouter (GPT-OSS-120B)...")
try:
    from openrouter import OpenRouter
    
    client = OpenRouter(api_key=os.getenv("OPENROUTER_API_KEY"))
    response = client.chat.send(
        model="openai/gpt-oss-120b:free",
        messages=[{"role": "user", "content": "Say hello in 3 words"}]
    )
    print(f"   ✅ LLM Response: {response.choices[0].message.content}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 2: OpenRouter (Embeddings)  
print("\n2️⃣ Testing OpenRouter (NVIDIA Embeddings)...")
try:
    response = client.embeddings.generate(
        model="nvidia/llama-nemotron-embed-vl-1b-v2:free",
        input="This is a test sentence for embedding."
    )
    embedding = response.data[0].embedding
    print(f"   ✅ Embedding dimension: {len(embedding)}")
    print(f"   ✅ First 5 values: {embedding[:5]}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 3: Pinecone
print("\n3️⃣ Testing Pinecone (Vector Database)...")
try:
    from pinecone import Pinecone, ServerlessSpec
    
    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
    
    # List existing indexes
    indexes = list(pc.list_indexes())
    print(f"   ✅ Connected to Pinecone")
    print(f"   ✅ Existing indexes: {[idx.get('name', idx) for idx in indexes]}")
    
    # Create test index if it doesn't exist
    index_name = "lecturelens-test"
    existing_names = [idx.get('name', idx) if isinstance(idx, dict) else str(idx) for idx in indexes]
    
    if index_name not in existing_names:
        print(f"   📝 Creating test index: {index_name}...")
        pc.create_index(
            name=index_name,
            dimension=4096,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1")
        )
        print(f"   ✅ Index created successfully")
    else:
        print(f"   ✅ Index '{index_name}' already exists")
    
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 4: Deepgram (Simplified test)
print("\n4️⃣ Testing Deepgram (Speech-to-Text)...")
try:
    import httpx
    
    api_key = os.getenv("DEEPGRAM_API_KEY")
    
    headers = {
        "Authorization": f"Token {api_key}",
        "Content-Type": "application/json"
    }
    
    url = "https://api.deepgram.com/v1/listen"
    params = {
        "model": "nova-2",
        "smart_format": "true"
    }
    payload = {
        "url": "https://static.deepgram.com/examples/Bueller-Life-moves-pretty-fast.wav"
    }
    
    response = httpx.post(url, headers=headers, params=params, json=payload, timeout=30.0)
    
    if response.status_code == 200:
        result = response.json()
        transcript = result["results"]["channels"][0]["alternatives"][0]["transcript"]
        print(f"   ✅ Deepgram API working")
        print(f"   ✅ Test transcript: {transcript[:100]}...")
    else:
        print(f"   ❌ Error: HTTP {response.status_code}")
    
except Exception as e:
    print(f"   ❌ Error: {e}")

print("\n" + "=" * 60)
print("✅ ALL API TESTS COMPLETE!")
print("=" * 60)
