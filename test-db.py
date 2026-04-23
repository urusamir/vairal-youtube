import requests

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
    "Authorization": f"Bearer {key}"
}

print(f"Fetching from {url}/rest/v1/calendar_slots?select=*")
res = requests.get(f"{url}/rest/v1/calendar_slots?select=*", headers=headers)
print("Status:", res.status_code)
print("Data:", res.text)
