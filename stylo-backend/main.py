import traceback

try:
    # Attempt to load the real application
    from true_main import app

except Exception as boot_exc:
    # If anything fails during import (missing modules, DB connection, config errors)
    # Start a minimal fallback app that serves the error message.
    error_trace = traceback.format_exc()
    from fastapi import FastAPI
    from fastapi.responses import PlainTextResponse

    app = FastAPI(title="STYLO API CRASH DIAGNOSTIC")

    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
    def crash_handler(path: str):
        return PlainTextResponse(
            f"STARTUP CRASH:\n\n{error_trace}",
            status_code=200,
        )


