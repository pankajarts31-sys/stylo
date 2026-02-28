"""
Quick SerpApi debug script: bypasses FastAPI to directly test the API call.
"""
import os, json
# Manually load the .env before importing settings
from dotenv import load_dotenv
load_dotenv()

serp_key = os.environ.get("SERPAPI_KEY", "")
print(f"SERPAPI_KEY loaded: {'YES (' + serp_key[:8] + '...)' if serp_key else 'NO - key missing!'}")

if not serp_key:
    print("ERROR: Key not found. Cannot test.")
    exit(1)

from serpapi import GoogleSearch

params = {
    "engine": "google_shopping",
    "q": "women's floral midi dress",
    "api_key": serp_key,
    "hl": "en",
    "gl": "us",
}

print("\nCalling SerpApi...")
search = GoogleSearch(params)
results = search.get_dict()

# Print top-level keys so we know the structure
print("Top-level keys returned:", list(results.keys()))

if "error" in results:
    print("API returned error:", results["error"])
elif "shopping_results" in results:
    sr = results["shopping_results"]
    print(f"shopping_results count: {len(sr)}")
    if sr:
        print("First result:")
        print(json.dumps(sr[0], indent=2))
else:
    print("'shopping_results' NOT found. Full response (truncated):")
    print(json.dumps({k: results[k] for k in list(results.keys())[:5]}, indent=2))
