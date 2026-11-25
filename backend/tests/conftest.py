import os
import pytest

os.environ.setdefault("JWT_SECRET", "f14c6518f8c0bc2f38bd35ddd39ddcd5ed1fe23bdc383ee15b9d518d264e4809")

from app import create_app


@pytest.fixture
def app():
    app = create_app()
    app.config.update({
        "TESTING": True
    })
    return app


@pytest.fixture
def client(app):
    return app.test_client()

from app.auth import gerar_token

@pytest.fixture
def token_empresa():
    return gerar_token(17, "empresa")

