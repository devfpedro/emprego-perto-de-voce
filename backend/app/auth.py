import os
import datetime
import jwt
from functools import wraps
from flask import request, jsonify

JWT_SECRET = os.environ.get('JWT_SECRET', 'chave_secreta_projeto_emprego_perto_2026')

def gerar_token(usuario_id, perfil):
    payload = {
        'id': usuario_id,
        'perfil': perfil,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

def token_requerido(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'erro': 'Token de autenticação ausente ou inválido.'}), 401
        
        token = auth_header.split(' ')[1]
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            request.usuario_logado = payload
        except jwt.ExpiredSignatureError:
            return jsonify({'erro': 'Token expirado.'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'erro': 'Token inválido.'}), 401
            
        return f(*args, **kwargs)
    return decorated

def token_opcional(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        request.usuario_logado = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                request.usuario_logado = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            except:
                pass
        return f(*args, **kwargs)
    return decorated