import os
from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)

    from app.routes.auth_routes import auth_bp
    from app.routes.localidades import localidades_bp
    from app.routes.vagas import vagas_bp
    from app.routes.empresas import empresas_bp
    from app.routes.candidaturas import candidaturas_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(localidades_bp)
    app.register_blueprint(vagas_bp)
    app.register_blueprint(empresas_bp)
    app.register_blueprint(candidaturas_bp)

    @app.route('/saude', methods=['GET'])
    def saude():
        return {"ok": True}, 200

    return app