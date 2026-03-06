"""MaternaCare FastAPI application entry point."""

import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError

from app.auth.exceptions import MaternaCareException
from app.config.settings import settings
from app.loggers import setup_logging
from app.middleware.audit_middleware import AuditMiddleware
from app.routes import app_router

logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Module SIH de suivi de grossesse et sante maternelle",
    docs_url="/docs",
    redoc_url="/redoc",
)

# --- Global exception handlers ---


@app.exception_handler(MaternaCareException)
async def maternacare_exception_handler(request: Request, exc: MaternaCareException):
    """Handle custom application exceptions."""
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Return Pydantic validation errors in a clean format."""
    errors = []
    for error in exc.errors():
        field = " > ".join(str(loc) for loc in error["loc"] if loc != "body")
        msg = error["msg"]
        # Strip Pydantic "Value error, " prefix for cleaner messages
        if msg.startswith("Value error, "):
            msg = msg[len("Value error, "):]
        errors.append({"field": field, "message": msg})
    return JSONResponse(
        status_code=422,
        content={"detail": errors},
    )


@app.exception_handler(IntegrityError)
async def integrity_error_handler(request: Request, exc: IntegrityError):
    """Handle database integrity constraint violations."""
    logger.warning("IntegrityError: %s", exc.orig)
    return JSONResponse(
        status_code=409,
        content={"detail": "Conflit de donnees: un enregistrement similaire existe deja."},
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Catch-all for unhandled exceptions."""
    logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "Erreur interne du serveur. Contactez l'administrateur."},
    )


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Audit middleware
app.add_middleware(AuditMiddleware)

# Logging
setup_logging()

# API routers
app.include_router(app_router)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }
