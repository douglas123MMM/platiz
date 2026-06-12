# config/__init__.py
import json
import os
import platform
from pathlib import Path

_CONFIG_PATH = Path(__file__).parent / "api_keys.json"

_ENV_MAP = {
    "openai_api_key": "OPENROUTER_API_KEY",
    "elevenlabs_api_key": "ELEVENLABS_API_KEY",
}

def get_config() -> dict:
    cfg = {}
    try:
        with open(_CONFIG_PATH, "r", encoding="utf-8") as f:
            cfg = json.load(f)
    except Exception:
        pass
    for cfg_key, env_var in _ENV_MAP.items():
        env_val = os.getenv(env_var, "")
        if env_val:
            cfg[cfg_key] = env_val
    return cfg

def get_os() -> str:
    """Returns 'windows' | 'mac' | 'linux' — detected at runtime, not from config."""
    s = platform.system().lower()
    if s == "darwin":
        return "mac"
    if s == "windows":
        return "windows"
    return "linux"

def is_windows() -> bool: return get_os() == "windows"
def is_mac()     -> bool: return get_os() == "mac"
def is_linux()   -> bool: return get_os() == "linux"
