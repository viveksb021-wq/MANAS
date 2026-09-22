import urllib.request
import json

queries = [
    ('as', 'আজি মোৰ কি কি কাম আছে?'),
    ('bn', 'আজ আমার কি কি কাজ আছে?'),
    ('hi', 'आज मेरा क्या काम है?'),
    ('ne', 'आज मेरो के के काम छ?'),
    ('kha', 'Kaei nga don mynta ka sngi?'),
    ('lus', 'Vawiinah eng nge ka tih dawn?')
]

# Obtain auth token
login_data = json.dumps({'phone_or_email': '+91 98765 43210', 'pin': '1234'}).encode('utf-8')
login_req = urllib.request.Request(
    'http://127.0.0.1:8000/api/auth/elderly-login',
    data=login_data,
    headers={'Content-Type': 'application/json'}
)
token = ''
try:
    with urllib.request.urlopen(login_req) as resp:
        auth_data = json.loads(resp.read().decode('utf-8'))
        token = auth_data.get('access_token', '')
        print('Authenticated successfully as patient.')
except Exception as e:
    print('Auth failed:', e)

for lang, q in queries:
    payload = json.dumps({'transcript': q, 'language': lang}).encode('utf-8')
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/voice/ask',
        data=payload,
        headers=headers
    )
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"[{lang.upper()}] Spoken Response: {data.get('spoken_response')}")
    except Exception as e:
        print(f"[{lang.upper()}] Error: {e}")
