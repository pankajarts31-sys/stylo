import requests
import json

try:
    print("Testing /api/feed ...")
    r = requests.get("http://localhost:8000/api/feed")
    print(f"Status: {r.status_code}")
    data = r.json()
    print(f"Total feed items: {data.get('total')}")
    if data.get("items"):
        print("First item:")
        print(json.dumps(data["items"][0], indent=2))
        
    print("\nTesting /api/search?q=zara jacket ...")
    r2 = requests.get("http://localhost:8000/api/search?q=zara jacket")
    print(f"Status: {r2.status_code}")
    data2 = r2.json()
    print(f"Total search items: {data2.get('count')}")
    if data2.get("matches"):
        print("First match:")
        print(json.dumps(data2["matches"][0], indent=2))
        
except Exception as e:
    print("Error:", e)
