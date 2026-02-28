import requests
import urllib.request

# Download a sample dress image
img_url = "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80" # Unsplash dress
urllib.request.urlretrieve(img_url, "test_dress.jpg")

# Push to our visual search endpoint
url = "http://localhost:8000/api/search/visual"
with open("test_dress.jpg", "rb") as f:
    files = {"file": ("test_dress.jpg", f, "image/jpeg")}
    r = requests.post(url, files=files)

print(f"Status: {r.status_code}")
print(r.json())
