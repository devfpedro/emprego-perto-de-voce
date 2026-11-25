
import re
from app.utils import obter_json_objeto
from flask import Blueprint, request, jsonify
from psycopg.errors import UniqueViolation
from werkzeug.security import generate_password_hash, check_password_hash
from app.validators import (
    validar_email,
    validar_cnpj,
    validar_telefone,
    validar_url,
    PERFIS_VALIDOS,
    AREAS_VALIDAS
)
from app.auth import gerar_token
from app.db import get_db_connection

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')


@auth_bp.route('/cadastro', methods=['POST'])
def cadastro():
    data, erro = obter_json_objeto()
    if erro:
        return jsonify(erro[0]), erro[1]
    perfil = str(data.get('perfil', '')).lower()

    email_raw = data.get('email')
    email = email_raw.lower().strip() if isinstance(email_raw, str) else ''

    senha = data.get('senha')

    telefone_raw = data.get('telefone')
    telefone = re.sub(r'\D', '', str(telefone_raw or ''))

    cnpj_raw = data.get('cnpj')
    cnpj = re.sub(r'\D', '', str(cnpj_raw or '')) if perfil == 'empresa' else None

    bairroId = data.get('bairroId')
    nome = data.get('nome')
    nome = nome.strip() if isinstance(nome, str) else ''

    if not isinstance(senha, str):
        return jsonify({'erro': 'E-mail e senha devem ser textos válidos.'}), 400

    if not perfil or not email or not senha or not telefone or not bairroId:
        return jsonify({'erro': 'Campos obrigatórios ausentes (Perfil, email, senha, telefone e bairroId são obrigatórios).'}), 400

    if perfil == 'candidato':
        if not nome or not data.get('areaInteresse'):
            return jsonify({'erro': 'Campos obrigatórios do candidato ausentes (nome, whatsapp, areaInteresse).'}), 400
    elif perfil == 'empresa':
        if not nome or not data.get('cnpj') or not data.get('setor'):
            return jsonify({'erro': 'Campos obrigatórios da empresa ausentes (nome, cnpj, setor).'}), 400

    if perfil not in PERFIS_VALIDOS:
        return jsonify({'erro': 'Perfil inválido. Use candidato ou empresa.'}), 400

    if len(nome) < 3:
        return jsonify({'erro': 'O nome deve conter no mínimo 3 caracteres.'}), 400

    if not validar_email(email):
        return jsonify({'erro': 'Informe um e-mail válido.'}), 400

    if len(senha) < 8:
        return jsonify({'erro': 'A senha deve conter no mínimo 8 caracteres.'}), 400

    if not validar_telefone(telefone):
        return jsonify({'erro': 'Telefone inválido. Deve conter 10 ou 11 dígitos.'}), 400

    if perfil == 'candidato':
        area_interesse = data.get('areaInteresse')

        if not isinstance(area_interesse, str) or area_interesse.strip() not in AREAS_VALIDAS:
            return jsonify({'erro': 'Área de interesse inválida.'}), 400

        area_interesse = area_interesse.strip()

        whatsapp_raw = data.get('whatsapp')
        whatsapp = re.sub(r'\D', '', whatsapp_raw) if isinstance(whatsapp_raw, str) else ''
        whatsapp = whatsapp or None

        if whatsapp and len(whatsapp) > 20:
            return jsonify({'erro': 'WhatsApp inválido. Deve conter no máximo 20 dígitos.'}), 400

    if perfil == 'empresa':
        setor = data.get('setor')

        if not isinstance(setor, str) or setor.strip() not in AREAS_VALIDAS:
            return jsonify({'erro': 'Setor inválido.'}), 400

        setor = setor.strip()

        if not validar_cnpj(cnpj):
            return jsonify({'erro': 'CNPJ inválido.'}), 400

        if not validar_url(data.get('site')):
            return jsonify({'erro': 'URL do site inválida.'}), 400

    senha_hash = generate_password_hash(senha)

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("BEGIN;")

                cur.execute("""
                    INSERT INTO usuarios (perfil, email, senha_hash, telefone)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id;
                """, (perfil, email, senha_hash, telefone))

                usuario_id = cur.fetchone()['id']

                if perfil == 'candidato':
                    cur.execute("""
                        INSERT INTO candidatos (usuario_id, nome, whatsapp, area_interesse, bairro_id)
                        VALUES (%s, %s, %s, %s, %s);
                    """, (
                        usuario_id,
                        nome,
                        whatsapp,
                        area_interesse,
                        bairroId
                    ))
                else:
                    cur.execute("""
                        INSERT INTO empresas (usuario_id, nome, cnpj, descricao, setor, site, bairro_id)
                        VALUES (%s, %s, %s, %s, %s, %s, %s);
                    """, (
                        usuario_id,
                        nome,
                        cnpj,
                        data.get('descricao'),
                        setor,
                        data.get('site'),
                        bairroId
                    ))

                conn.commit()

        return jsonify({'mensagem': 'Usuário cadastrado com sucesso', 'id': usuario_id}), 201

    except UniqueViolation as e:
        constraint_name = e.diag.constraint_name

        if constraint_name == 'usuarios_email_key':
            return jsonify({'erro': 'Este e-mail já está em uso.'}), 409

        if constraint_name == 'empresas_cnpj_key':
            return jsonify({'erro': 'Este CNPJ já está em uso.'}), 409

        return jsonify({'erro': 'Um registro com esses dados já existe.'}), 409

    except Exception as e:
        erro_msg = str(e)

        if 'violates check constraint' in erro_msg or 'violates foreign key' in erro_msg or 'empresas_cnpj_valido' in erro_msg:
            return jsonify({'erro': 'Dados enviados violam as regras do banco de dados (verifique o CNPJ ou campos informados).'}), 400

        return jsonify({'erro': 'Erro interno ao cadastrar usuário.'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    data, erro = obter_json_objeto()
    if erro:
        return jsonify(erro[0]), erro[1]

    email_raw = data.get('email')
    email = email_raw.lower().strip() if isinstance(email_raw, str) else ''

    senha = data.get('senha')

    if not validar_email(email) or not isinstance(senha, str) or not senha:
        return jsonify({'erro': 'E-mail ou senha inválidos.'}), 401

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT id, perfil, email, senha_hash
                    FROM usuarios
                    WHERE email = %s;
                """, (email,))
                usuario = cur.fetchone()

                if not usuario or not check_password_hash(usuario['senha_hash'], senha):
                    return jsonify({'erro': 'E-mail ou senha inválidos.'}), 401

                nome_usuario = ""

                if usuario['perfil'] == 'candidato':
                    cur.execute("SELECT nome FROM candidatos WHERE usuario_id = %s;", (usuario['id'],))
                    res = cur.fetchone()
                    if res:
                        nome_usuario = res['nome']
                else:
                    cur.execute("SELECT nome FROM empresas WHERE usuario_id = %s;", (usuario['id'],))
                    res = cur.fetchone()
                    if res:
                        nome_usuario = res['nome']

        token = gerar_token(usuario_id=usuario['id'], perfil=usuario['perfil'])

        return jsonify({
            'token': token,
            'perfil': usuario['perfil'],
            'usuario': {
                'id': usuario['id'],
                'nome': nome_usuario,
                'email': usuario['email']
            }
        }), 200

    except Exception:
        return jsonify({'erro': 'Erro interno ao realizar login.'}), 500
