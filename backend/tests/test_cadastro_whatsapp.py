import os
import random
import uuid
from pathlib import Path

import pytest
from dotenv import load_dotenv

from app.db import get_db_connection

# Estes testes gravam no banco de desenvolvimento (e limpam ao final).
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

pytestmark = pytest.mark.skipif(
    not os.environ.get("DATABASE_URL"),
    reason="DATABASE_URL não configurada: testes de cadastro precisam do banco",
)


def _cnpj_valido():
    digitos = [random.randint(0, 9) for _ in range(12)]
    if len(set(digitos)) == 1:
        digitos[0] = (digitos[0] + 1) % 10

    def digito(base, pesos):
        resto = sum(d * p for d, p in zip(base, pesos)) % 11
        return 0 if resto < 2 else 11 - resto

    digitos.append(digito(digitos, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]))
    digitos.append(digito(digitos, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]))
    return "".join(map(str, digitos))


def _telefone():
    return "839" + "".join(str(random.randint(0, 9)) for _ in range(8))


@pytest.fixture
def emails_criados(app):
    """Registra e-mails usados no teste e remove os registros ao final."""
    emails = []
    yield emails

    if not emails:
        return

    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id FROM usuarios WHERE email = ANY(%s);", (emails,)
            )
            ids = [linha["id"] for linha in cur.fetchall()]
            if ids:
                cur.execute("DELETE FROM candidatos WHERE usuario_id = ANY(%s);", (ids,))
                cur.execute("DELETE FROM empresas WHERE usuario_id = ANY(%s);", (ids,))
                cur.execute("DELETE FROM usuarios WHERE id = ANY(%s);", (ids,))


def _payload_candidato(email, **extra):
    payload = {
        "perfil": "candidato",
        "nome": "Teste Whatsapp",
        "email": email,
        "senha": "Teste@1234",
        "telefone": _telefone(),
        "areaInteresse": "comercio",
        "bairroId": 1,
    }
    payload.update(extra)
    return payload


def _whatsapp_gravado(email):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT c.whatsapp
                FROM candidatos c
                JOIN usuarios u ON u.id = c.usuario_id
                WHERE u.email = %s;
                """,
                (email,),
            )
            linha = cur.fetchone()
    assert linha is not None, "candidato não foi gravado no banco"
    return linha["whatsapp"]


def _cadastrar_candidato(client, emails_criados, **extra):
    email = f"teste.whatsapp.{uuid.uuid4().hex[:12]}@email.com"
    emails_criados.append(email)
    resposta = client.post("/auth/cadastro", json=_payload_candidato(email, **extra))
    return email, resposta


def test_cadastro_candidato_sem_campo_whatsapp(client, emails_criados):
    email, resposta = _cadastrar_candidato(client, emails_criados)

    assert resposta.status_code == 201
    assert _whatsapp_gravado(email) is None


@pytest.mark.parametrize("valor", ["", "   "])
def test_cadastro_candidato_whatsapp_vazio_ou_espacos(client, emails_criados, valor):
    email, resposta = _cadastrar_candidato(client, emails_criados, whatsapp=valor)

    assert resposta.status_code == 201
    assert _whatsapp_gravado(email) is None


def test_cadastro_candidato_whatsapp_formatado_grava_so_digitos(client, emails_criados):
    email, resposta = _cadastrar_candidato(
        client, emails_criados, whatsapp="(83) 99999-0000"
    )

    assert resposta.status_code == 201
    assert _whatsapp_gravado(email) == "83999990000"


def test_cadastro_candidato_whatsapp_so_simbolos(client, emails_criados):
    email, resposta = _cadastrar_candidato(client, emails_criados, whatsapp="()-")

    assert resposta.status_code == 201
    assert _whatsapp_gravado(email) is None


def test_cadastro_candidato_whatsapp_acima_do_limite(client, emails_criados):
    email, resposta = _cadastrar_candidato(
        client, emails_criados, whatsapp="8" * 21
    )

    assert resposta.status_code == 400
    assert "erro" in resposta.json


def test_cadastro_empresa_continua_funcionando(client, emails_criados):
    email = f"teste.empresa.{uuid.uuid4().hex[:12]}@email.com"
    emails_criados.append(email)

    resposta = client.post(
        "/auth/cadastro",
        json={
            "perfil": "empresa",
            "nome": "Empresa Teste Whatsapp",
            "email": email,
            "senha": "Teste@1234",
            "telefone": _telefone(),
            "cnpj": _cnpj_valido(),
            "setor": "comercio",
            "bairroId": 1,
        },
    )

    assert resposta.status_code == 201
