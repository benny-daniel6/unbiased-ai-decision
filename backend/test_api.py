import requests

with open('../sample_data.csv', 'rb') as f:
    files = {'file': f}
    r = requests.post('http://localhost:8000/analyze?target_column=income&protected_attribute=sex', files=files)
    print(r.status_code)
    print(r.text)
