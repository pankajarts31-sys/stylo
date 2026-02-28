import os
import json
from app.services.shopping import search_fashion_items

print("Directly calling search_fashion_items...")
results = search_fashion_items("zara jacket", max_results=2)
print("Results returned:", len(results))
print(json.dumps(results, indent=2))
