"""Audit middleware that logs every API request."""

import time
from datetime import datetime, timezone

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from app.config.database import async_session_factory
from app.auth.security import decode_access_token
from app.models.audit_models import AuditLog


class AuditMiddleware(BaseHTTPMiddleware):
    """Middleware that creates an audit log entry for every API request."""

    SKIP_PATHS = {"/docs", "/redoc", "/openapi.json", "/health"}

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        if request.url.path in self.SKIP_PATHS:
            return await call_next(request)

        start_time = time.time()
        response = await call_next(request)
        duration_ms = round((time.time() - start_time) * 1000)

        # Extract user from token if present
        user_id = None
        auth_header = request.headers.get("authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
            payload = decode_access_token(token)
            if payload:
                user_id = int(payload.get("sub", 0)) or None

        # Get client IP
        ip_address = request.client.host if request.client else None

        # Build action description
        action = f"{request.method} {request.url.path}"
        entity_type = self._extract_entity_type(request.url.path)
        entity_id = self._extract_entity_id(request.url.path)

        details = (
            f"status={response.status_code} duration={duration_ms}ms"
        )

        # Log asynchronously
        try:
            async with async_session_factory() as session:
                audit_entry = AuditLog(
                    user_id=user_id,
                    action=action,
                    entity_type=entity_type,
                    entity_id=entity_id,
                    details=details,
                    ip_address=ip_address,
                    timestamp=datetime.now(timezone.utc),
                )
                session.add(audit_entry)
                await session.commit()
        except Exception:
            # Never let audit logging break the request
            pass

        return response

    @staticmethod
    def _extract_entity_type(path: str) -> str:
        """Extract entity type from URL path."""
        parts = path.strip("/").split("/")
        # Skip 'api', 'v1', 'fhir' prefixes
        for part in parts:
            if part in ("api", "v1", "fhir"):
                continue
            if not part.isdigit():
                return part
        return "unknown"

    @staticmethod
    def _extract_entity_id(path: str) -> int | None:
        """Extract entity ID from URL path if present."""
        parts = path.strip("/").split("/")
        for part in parts:
            if part.isdigit():
                return int(part)
        return None
