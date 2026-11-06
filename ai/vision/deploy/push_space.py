"""ai/vision을 Hugging Face Space(Docker, 무료 CPU)로 올린다.

사용: hf auth login (write 토큰) 후  python ai/vision/deploy/push_space.py <아이디>/rendy-vision
"""
import shutil
import sys
import tempfile
from pathlib import Path

from huggingface_hub import HfApi

repo_id = sys.argv[1]
vision = Path(__file__).resolve().parents[1]
root = vision.parents[1]
with tempfile.TemporaryDirectory() as d:
    d = Path(d)
    shutil.copytree(vision / "service", d / "service", ignore=shutil.ignore_patterns("__pycache__"))
    for f in ["requirements.txt", "requirements-model.txt"]:
        shutil.copy(vision / f, d / f)
    for f in ["README.md", "Dockerfile"]:
        shutil.copy(vision / "deploy" / "hf-space" / f, d / f)
    pol = d / "packages" / "shared" / "policy"
    pol.mkdir(parents=True)
    shutil.copy(root / "packages" / "shared" / "policy" / "damage-policy.json", pol)
    api = HfApi()
    api.create_repo(repo_id, repo_type="space", space_sdk="docker", exist_ok=True)
    api.upload_folder(folder_path=str(d), repo_id=repo_id, repo_type="space", commit_message="deploy rendy vision")
    print(f"https://huggingface.co/spaces/{repo_id}")
