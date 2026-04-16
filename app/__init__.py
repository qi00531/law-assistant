from pathlib import Path


_BACKEND_APP_DIR = Path(__file__).resolve().parent.parent / "backend" / "app"

# Expose `backend/app` as the canonical `app` package when running commands
# from the repository root.
__path__ = [str(_BACKEND_APP_DIR)]
