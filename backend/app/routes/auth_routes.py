import re
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from app.validators import validar_email, validar_cnpj, validar_telefone, validar_url, PERFIS_VALIDOS
from app.auth import gerar_token
from app.db import get_db_connection

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/cadastro', methods=['POST'])
def cadastro():
    data = request.get_json() or {}
    perfil = str(data.get('perfil', '')).lower()

    email_raw = data.get('email')
    email = email_raw.lower().strip() if email_raw else ''

    senha = data.get('senha')

    telefone_raw = data.get('telefone')
    telefone = re.sub(r'\D', '', str(telefone_raw or ''))

    cnpj_raw = data.get('cnpj')
    cnpj = re.sub(r'\D', '', str(cnpj_raw or '')) if perfil == 'empresa' else None

    bairroId = data.get('bairroId')

    if not perfil or not email or not senha or not telefone or not bairroId:
        return jsonify({'erro': 'Campos obrigatórios ausentes (Perfil, email, senha, telefone e bairroId são obrigatórios),'}) , 400

    if perfil == 'candidato':
        if not data.get('nome') or not data.get('whatsapp') or not data.get('areaInteresse'):
            return jsonify({'erro': 'Campos obrigatórios do candidato ausentes (nome, whatsapp, areaInteresse).'}), 400
    elif perfil == 'empresa':
        if not data.get('nome') or not data.get('cnpj') or not data.get('setor'):
            return jsonify({'erro': 'Campos obrigatórios da empresa ausentes (nome, cnpj, setor).'}), 400
    
    if perfil not in PERFIS_VALIDOS:
        return jsonify({'erro': 'Perfil inválido. Use candidato ou empresa.'}), 400
    if not validar_email(email):
        return jsonify({'erro': 'Informe um e-mail válido.'}), 400
    if not senha or len(senha) < 8:
        return jsonify({'erro': 'A senha deve conter no mínimo 8 caracteres.'}), 400
    if not validar_telefone(telefone):
        return jsonify({'erro': 'Telefone inválido. Deve conter 10 ou 11 dígitos.'}), 400
    if not bairroId:
        return jsonify({'erro': 'O bairro é obrigatório para o cadastro de candidato!'}), 400
    
    if perfil == 'empresa':
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
                        data.get('nome'), 
                        data.get('whatsapp'), 
                        data.get('areaInteresse'), 
                        bairroId 
                    ))
                else:
                    cur.execute("""
                        INSERT INTO empresas (usuario_id, nome, cnpj, descricao, setor, site, bairro_id)
                        VALUES (%s, %s, %s, %s, %s, %s, %s);
                    """, (
                        usuario_id,
                        data.get('nome'),
                        cnpj,
                        data.get('descricao'),
                        data.get('setor'),
                        data.get('site'),
                        bairroId
                    ))
                
                conn.commit()

        return jsonify({'mensagem': 'Usuário cadastrado com sucesso', 'id': usuario_id}), 201

    except Exception as e:
        erro_msg = str(e)
        if 'usuarios_email_key' in erro_msg or 'empresas_cnpj_key' in erro_msg or 'empresas_cnpj_valido' in erro_msg:
            return jsonify({'erro': 'Este e-mail ou CNPJ já está em uso.'}), 409
        if 'violates check constraint' in erro_msg or 'violates foreign key' in erro_msg:
            return jsonify({'erro': 'Dados enviados violam as regras do banco de dados.'}), 400
            
        return jsonify({'erro': 'Erro interno ao cadastrar usuário.'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}

    email_raw = data.get('email')
    email = email_raw.lower().strip() if email_raw else ''
    
    senha = data.get('senha')

    if not validar_email(email) or not senha:
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
                    if res: nome_usuario = res['nome']
                else:
                    cur.execute("SELECT nome FROM empresas WHERE usuario_id = %s;", (usuario['id'],))
                    res = cur.fetchone()
                    if res: nome_usuario = res['nome']

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