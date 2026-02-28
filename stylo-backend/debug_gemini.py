import requests

live_url = "http://localhost:8000/api/search/visual"
with open("prod_test_image.jpg", "rb") as f:
    response = requests.post(
        live_url, 
        files={"file": ("prod_test_image.jpg", f, "image/jpeg")}
    )

print("STATUS:", response.status_code)
print("RESPONSE:", response.text)
