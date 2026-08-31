import os
import json
import base64
import urllib.request

token = os.environ.get("GITHUB_PERSONAL_ACCESS_TOKEN")
owner = "DAG94S"
repo = "educational-vibe-apps"
branch = "main"
base_dir = r"F:\Proyectos_GITHUB\educational-vibe-apps"

files_to_push = []
for root, dirs, files in os.walk(base_dir):
    if ".git" in root:
        continue
    for file in files:
        if file == "upload_all.py":
            continue
        full_path = os.path.join(root, file)
        rel_path = os.path.relpath(full_path, base_dir).replace("\\", "/")
        files_to_push.append((rel_path, full_path))

print(f"Total files to push: {len(files_to_push)}")

headers = {
    "Authorization": f"Bearer {token}",
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": "DAG94S-Uploader"
}

success_count = 0
fail_count = 0

for rel_path, full_path in files_to_push:
    with open(full_path, "rb") as f:
        content_bytes = f.read()
    
    url = f"https://api.github.com/repos/{owner}/{repo}/contents/{rel_path}"
    
    sha = None
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            sha = data.get("sha")
    except Exception:
        pass
    
    payload = {
        "message": f"feat: upload {rel_path}",
        "content": base64.b64encode(content_bytes).decode("utf-8"),
        "branch": branch
    }
    if sha:
        payload["sha"] = sha
        
    req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="PUT")
    try:
        with urllib.request.urlopen(req) as resp:
            success_count += 1
            if success_count % 10 == 0:
                print(f"[OK] Uploaded {success_count}/{len(files_to_push)} files...")
    except Exception as e:
        fail_count += 1
        print(f"[FAIL] Failed to upload {rel_path}: {e}")

print(f"Upload complete! Success: {success_count}, Failures: {fail_count}")
