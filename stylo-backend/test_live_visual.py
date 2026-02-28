import requests
import urllib.request
import json
import time

live_url = "http://localhost:8000/api/search/visual"
print(f"Testing Live Visual Search endpoint: {live_url}")

try:
    # Use a sample image of a jacket from Unsplash
    image_url = "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80"
    print(f"Downloading test image from Unsplash: {image_url}")
    urllib.request.urlretrieve(image_url, "prod_test_image.jpg")
    
    # POST to Railway
    print("Uploading to local backend for Gemini inference...")
    start_time = time.time()
    with open("prod_test_image.jpg", "rb") as f:
        response = requests.post(
            live_url, 
            files={"file": ("prod_test_image.jpg", f, "image/jpeg")}
        )
    
    duration = time.time() - start_time
    print(f"Response Received in {duration:.2f} seconds! Status Code: {response.status_code}")
    
    if response.status_code == 200:
        results = response.json().get("results", [])
        print(f"\n✅ SUCCESS! Found {len(results)} matches:")
        for idx, item in enumerate(results, 1):
            print(f" {idx}. {item['brand']} - {item['title']} (Score: {item.get('similarity_score', 0):.4f})")
    else:
        print(f"❌ Error: {response.text}")

except Exception as e:
    print(f"Error during test: {e}")
