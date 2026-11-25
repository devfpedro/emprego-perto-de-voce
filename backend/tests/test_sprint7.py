import json


def test_saude(client):
    resposta = client.get("/saude")
    assert resposta.status_code == 200
    assert resposta.json == {"ok": True}


def test_d3_corpo_texto_em_vez_de_json(client):
    resposta = client.post(
        "/auth/login",
        data="teste",
        content_type="text/plain"
    )
    assert resposta.status_code == 400
    assert "erro" in resposta.json


def test_d21_json_raiz_lista(client):
    resposta = client.post(
        "/auth/login",
        data=json.dumps(["teste"]),
        content_type="application/json"
    )
    assert resposta.status_code == 400
    assert "erro" in resposta.json


def test_d21_json_malformado(client):
    resposta = client.post(
        "/auth/login",
        data='{"email":',
        content_type="application/json"
    )
    assert resposta.status_code == 400
    assert "erro" in resposta.json
def test_d5_put_titulo_com_tipo_invalido(client, token_empresa):
    resposta = client.put(
        "/vagas/999999",
        headers={"Authorization": f"Bearer {token_empresa}"},
        json={
            "titulo": 123,
            "descricao": "Descrição válida com mais de vinte caracteres",
            "requisitos": "Experiência",
            "area": "comercio",
            "contrato": "clt",
            "regime": "presencial",
            "turno": "integral",
            "bairroId": 1,
            "salario": None,
            "status": "aberta"
        }
    )

    assert resposta.status_code == 400
    assert "erro" in resposta.json


def test_d7_put_bairro_id_invalido(client, token_empresa):
    resposta = client.put(
        "/vagas/999999",
        headers={"Authorization": f"Bearer {token_empresa}"},
        json={
            "titulo": "Vaga de atendente",
            "descricao": "Descrição válida com mais de vinte caracteres",
            "requisitos": "Experiência",
            "area": "comercio",
            "contrato": "clt",
            "regime": "presencial",
            "turno": "integral",
            "bairroId": "abc",
            "salario": None,
            "status": "aberta"
        }
    )

    assert resposta.status_code == 400
    assert "erro" in resposta.json
