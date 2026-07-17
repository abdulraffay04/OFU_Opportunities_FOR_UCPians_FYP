# test_chatbot.py
# Quick test to verify the UCP AI Chatbot is responding.

import requests
import json

print("Testing chatbot...")

try:
    response = requests.post(
        "http://localhost:8001/chat",
        json={"message": "How do I apply for internship?"},
        timeout=30
    )
    print("Status:", response.status_code)
    print("Response:", json.dumps(response.json(), indent=2))
except Exception as e:
    print("Error:", str(e))
