import time
import hashlib
from typing import Any, Optional
from threading import Lock, Semaphore

class TTLCache:
    """Thread-safe in-memory cache with Time-To-Live (TTL) and LRU-like pruning."""
    def __init__(self, max_size: int = 1500, default_ttl: int = 86400):
        self.max_size = max_size
        self.default_ttl = default_ttl
        self._cache: dict[str, tuple[float, Any]] = {}
        self._lock = Lock()

    def _cleanup(self, now: float):
        if len(self._cache) > self.max_size:
            # Purge expired keys
            expired = [k for k, (exp, _) in self._cache.items() if exp <= now]
            for k in expired:
                self._cache.pop(k, None)
            # If still exceeding capacity, prune oldest items
            if len(self._cache) > self.max_size:
                sorted_keys = sorted(self._cache.keys(), key=lambda k: self._cache[k][0])
                for k in sorted_keys[: len(sorted_keys) // 4]:
                    self._cache.pop(k, None)

    def get(self, key: str) -> Optional[Any]:
        now = time.time()
        with self._lock:
            entry = self._cache.get(key)
            if not entry:
                return None
            expiry, value = entry
            if now > expiry:
                self._cache.pop(key, None)
                return None
            return value

    def set(self, key: str, value: Any, ttl: Optional[int] = None):
        now = time.time()
        expiry = now + (ttl if ttl is not None else self.default_ttl)
        with self._lock:
            self._cleanup(now)
            self._cache[key] = (expiry, value)

    def delete(self, key: str):
        with self._lock:
            self._cache.pop(key, None)

    def clear(self):
        with self._lock:
            self._cache.clear()

    @property
    def size(self) -> int:
        with self._lock:
            return len(self._cache)


# Global AI response cache (24 hour TTL by default)
ai_cache = TTLCache(max_size=2000, default_ttl=86400)

# Global concurrency guard: limits simultaneous heavy AI network calls to prevent external API rate-limit exhaustion
AI_CONCURRENCY_SEMAPHORE = Semaphore(4)


def make_deck_cache_key(topic: str, card_count: int) -> str:
    cleaned = topic.strip().lower()
    return f"deck:{hashlib.sha256(cleaned.encode()).hexdigest()}:{card_count}"


def make_chat_cache_key(context: str, message: str) -> str:
    combined = f"{context.strip()}|||{message.strip().lower()}"
    return f"chat:{hashlib.sha256(combined.encode()).hexdigest()}"


def make_readout_cache_key(deck_id: int, card_count: int, title: str) -> str:
    return f"readout:{deck_id}:{card_count}:{hashlib.sha256(title.strip().encode()).hexdigest()[:16]}"

