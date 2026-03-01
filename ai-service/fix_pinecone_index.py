"""Fix Pinecone index dimension"""
from pinecone import Pinecone, ServerlessSpec
import os
from dotenv import load_dotenv

load_dotenv()

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

print("=" * 60)
print("FIXING PINECONE INDEX")
print("=" * 60)

# Delete all old indexes
print("\n🗑️ Deleting old indexes...")
indexes = list(pc.list_indexes())
for idx in indexes:
    index_name = idx.get('name', str(idx))
    print(f"  Deleting: {index_name}")
    pc.delete_index(index_name)

print("✅ Old indexes deleted")

# Create new index with correct dimension
print("\n📝 Creating new index with dimension 2048...")
pc.create_index(
    name="lecturelens",
    dimension=2048,  # Correct dimension for NVIDIA embeddings
    metric="cosine",
    spec=ServerlessSpec(cloud="aws", region="us-east-1")
)

print("✅ New index 'lecturelens' created successfully")
print("\n" + "=" * 60)
print("✅ PINECONE INDEX FIXED!")
print("=" * 60)
print("\nYou can now run the RAG test again.")
