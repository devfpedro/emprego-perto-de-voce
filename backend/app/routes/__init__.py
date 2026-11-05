from app.routes.auth_routes import auth_bp
from app.routes.localidades import localidades_bp
from app.routes.vagas import vagas_bp
from app.routes.empresas import empresas_bp
from app.routes.candidaturas import candidaturas_bp

__all__ = ['auth_bp', 'localidades_bp', 'vagas_bp', 'empresas_bp', 'candidaturas_bp']