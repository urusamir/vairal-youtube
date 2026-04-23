import requests
import json

url = ""
key = ""

with open(".env.local", "r") as f:
    for line in f:
        if line.startswith("NEXT_PUBLIC_SUPABASE_URL"):
            url = line.split("=")[1].strip().replace('"', '')
        elif line.startswith("NEXT_PUBLIC_SUPABASE_ANON_KEY"):
            key = line.split("=")[1].strip().replace('"', '')

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

payload = {
    "user_id": "local-dev-user",
    "date": "2026-05-01",
    "influencer_name": "Test",
    "platform": "Instagram",
    "content_type": "Story",
    "status": "Pending"
}

print(f"Inserting for local-dev-user...")
res = requests.post(f"{url}/rest/v1/calendar_slots", headers=headers, json=payload)
print("Status:", res.status_code)
print("Data:", res.text)
