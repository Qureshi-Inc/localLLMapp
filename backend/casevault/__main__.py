import uvicorn

from casevault.config import settings
from casevault.utils.logging import setup_logging

setup_logging(settings.log_level, settings.log_format)


def run() -> None:
    uvicorn.run(
        "casevault.app:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level=settings.log_level.lower(),
    )


if __name__ == "__main__":
    run()
