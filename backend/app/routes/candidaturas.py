from flask import Blueprint, request, jsonify
from app.auth import token_requerido
from app.db import get_db_connection
from app.validators import STATUS_CANDIDATURA_VALIDOS

candidaturas_bp = Blueprint('candidaturas', __name__)

@candidaturas_bp.route('/vagas/<int:vaga_id>/candidaturas', methods=['POST'])
@token_requerido
def candidatar(vaga_id):
    usuario = request.usuario_logado
    if usuario['perfil'] != 'candidato':
        return jsonify({'erro': 'Apenas candidatos podem se candidatar a vagas.'}), 403

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT status FROM vagas WHERE id = %s;", (vaga_id,))
                vaga = cur.fetchone()
                
                if not vaga:
                    return jsonify({'erro': 'Vaga não encontrada.'}), 404
                if vaga['status'] != 'aberta':
                    return jsonify({'erro': 'Você já se candidatou a esta vaga ou a vaga não está aberta.'}), 409

                cur.execute("""
                    INSERT INTO candidaturas (vaga_id, candidato_id, status)
                    VALUES (%s, %s, 'enviada')
                    RETURNING id;
                """, (vaga_id, usuario['id']))
                candidatura_id = cur.fetchone()['id']
                conn.commit()

        return jsonify({
            'id': candidatura_id,
            'vagaId': vaga_id,
            'status': 'enviada'
        }), 201
    except Exception as e:
        if 'uq_candidaturas_vaga_candidato' in str(e):
            return jsonify({'erro': 'Você já se candidatou a esta vaga ou a vaga não está aberta.'}), 409
        return jsonify({'erro': 'Erro interno ao registrar candidatura.'}), 500


@candidaturas_bp.route('/candidaturas/minhas', methods=['GET'])
@token_requerido
def minhas_candidaturas():
    usuario = request.usuario_logado
    if usuario['perfil'] != 'candidato':
        return jsonify({'erro': 'Acesso negado.'}), 403

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT c.id, c.status, c.criado_em,
                           v.id AS vaga_id, v.titulo,
                           e.nome AS empresa_nome,
                           b.nome AS bairro_nome
                    FROM candidaturas c
                    JOIN vagas v ON c.vaga_id = v.id
                    JOIN empresas e ON v.empresa_id = e.usuario_id
                    JOIN bairros b ON v.bairro_id = b.id
                    WHERE c.candidato_id = %s
                    ORDER BY c.criado_em DESC;
                """, (usuario['id'],))
                registros = cur.fetchall()

        minhas = []
        for reg in registros:
            minhas.append({
                "id": reg['id'],
                "vaga": {"id": reg['vaga_id'], "titulo": reg['titulo']},
                "empresa": reg['empresa_nome'],
                "bairro": reg['bairro_nome'],
                "data": reg['criado_em'].isoformat(),
                "status": reg['status']
            })

        return jsonify(minhas), 200
    except Exception:
        return jsonify({'erro': 'Erro interno ao buscar inscrições.'}), 500


@candidaturas_bp.route('/empresa/candidaturas', methods=['GET'])
@token_requerido
def listar_candidaturas_empresa():
    usuario = request.usuario_logado
    if usuario['perfil'] != 'empresa':
        return jsonify({'erro': 'Acesso negado.'}), 403

    vaga_id = request.args.get('vagaId', type=int)
    status_filtro = request.args.get('status', '').lower()

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                query = """
                    SELECT c.id, c.status, c.criado_em,
                           cand.nome AS candidato_nome, cand.curriculo_path,
                           v.titulo AS cargo,
                           b.nome AS bairro_nome
                    FROM candidaturas c
                    JOIN candidatos cand ON c.candidato_id = cand.usuario_id
                    JOIN vagas v ON c.vaga_id = v.id
                    JOIN bairros b ON cand.bairro_id = b.id
                    WHERE v.empresa_id = %s
                """
                params = [usuario['id']]

                if vaga_id:
                    query += " AND c.vaga_id = %s"
                    params.append(vaga_id)
                if status_filtro:
                    query += " AND c.status = %s"
                    params.append(status_filtro)

                query += " ORDER BY c.criado_em DESC;"
                cur.execute(query, params)
                registros = cur.fetchall()

        resultado = []
        for reg in registros:
            resultado.append({
                "id": reg['id'],
                "candidatoNome": reg['candidato_nome'],
                "cargoPretendido": reg['cargo'],
                "bairro": reg['bairro_nome'],
                "dataCandidatura": reg['criado_em'].isoformat(),
                "status": reg['status'],
                "urlCurriculoPdf": reg['curriculo_path']
            })

        return jsonify(resultado), 200
    except Exception:
        return jsonify({'erro': 'Erro interno ao listar candidatos.'}), 500


@candidaturas_bp.route('/candidaturas/<int:candidatura_id>/status', methods=['PATCH'])
@token_requerido
def alterar_status_candidatura(candidatura_id):
    usuario = request.usuario_logado
    if usuario['perfil'] != 'empresa':
        return jsonify({'erro': 'Acesso negado.'}), 403

    data = request.get_json() or {}
    novo_status = str(data.get('status', '')).lower()

    if novo_status not in STATUS_CANDIDATURA_VALIDOS:
        return jsonify({'erro': 'Status inválido fornecido.'}), 400

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT v.empresa_id 
                    FROM candidaturas c
                    JOIN vagas v ON c.vaga_id = v.id
                    WHERE c.id = %s;
                """, (candidatura_id,))
                vinculo = cur.fetchone()

                if not vinculo:
                    return jsonify({'erro': 'Candidatura não encontrada.'}), 404
                if vinculo['empresa_id'] != usuario['id']:
                    return jsonify({'erro': 'Sua empresa não possui permissão para alterar esta candidatura.'}), 403

                cur.execute("""
                    UPDATE candidaturas 
                    SET status = %s 
                    WHERE id = %s;
                """, (novo_status, candidatura_id))
                conn.commit()

        return jsonify({"mensagem": "Status da candidatura atualizado."}), 200
    except Exception:
        return jsonify({'erro': 'Erro interno ao atualizar status.'}), 500