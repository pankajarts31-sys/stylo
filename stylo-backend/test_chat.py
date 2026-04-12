import requests
history = [{"role": "user", "content": "hi"}, {"role": "model", "content": "hello user"}]
resp = requests.post("http://localhost:8000/api/stylist/stream", json={"message": "hello again", "history": history}, stream=True)
print(resp.status_code)
for line in resp.iter_lines():
    if line:
        print(line.decode('utf-8'))
