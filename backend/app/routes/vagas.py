from flask import Blueprint, request, jsonify
from app.utils import calcular_haversine
from app.db import get_db_connection
from app.auth import token_requerido, token_opcional
from app.validators import AREAS_VALIDAS, CONTRATOS_VALIDOS, REGIMES_VALIDOS, TURNOS_VALIDOS, STATUS_VAGA_VALIDOS

vagas_bp = Blueprint('vagas', __name__)

@vagas_bp.route('/vagas', methods=['GET'])
@token_opcional
def listar_vagas():
    q = request.args.get('q', '').lower()
    area = request.args.get('area', '').lower()
    contrato = request.args.get('contrato', '').lower()
    

    bairro_id_arg = request.args.get('bairroId')
    bairro_id = None

    if bairro_id_arg:
        try:
            bairro_id = int(bairro_id_arg)
        except (ValueError, TypeError):
            return jsonify({'erro': 'O parâmetro bairroId deve ser um número inteiro.'}), 400

    try:
        lat = request.args.get('lat', type=float)
        lng = request.args.get('lng', type=float)
        raio_km = request.args.get('raioKm', default=10, type=float)
    except (ValueError, TypeError):
        return jsonify({'erro': 'Parâmetros de geolocalização ou raio inválidos.'}), 400

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                if lat is None or lng is None:
                    if request.usuario_logado and request.usuario_logado.get('perfil') == 'candidato':
                        cur.execute("""
                            SELECT b.latitude, b.longitude 
                            FROM candidatos c
                            JOIN bairros b ON c.bairro_id = b.id
                            WHERE c.usuario_id = %s;
                        """, (request.usuario_logado['id'],))
                        coords = cur.fetchone()
                        if coords:
                            lat = float(coords['latitude'])
                            lng = float(coords['longitude'])

                query = """
                    SELECT v.id, v.titulo, v.area, v.contrato,
                           e.usuario_id AS empresa_id, e.nome AS empresa_nome,
                           b.id AS bairro_id, b.nome AS bairro_nome, b.latitude, b.longitude
                    FROM vagas v
                    JOIN empresas e ON v.empresa_id = e.usuario_id
                    JOIN bairros b ON v.bairro_id = b.id
                    WHERE v.status = 'aberta'
                """
                params = []
                
                if q:
                    query += " AND LOWER(v.titulo) LIKE %s"
                    params.append(f"%{q}%")
                if area:
                    query += " AND v.area = %s"
                    params.append(area)
                if contrato:
                    query += " AND v.contrato = %s"
                    params.append(contrato)
                if bairro_id:
                    query += " AND v.bairro_id = %s"
                    params.append(bairro_id)
                    
                cur.execute(query, params)
                vagas = cur.fetchall()

        resultado = []
        for vaga in vagas:
            dist = 0.0
            if lat is not None and lng is not None:
                dist = calcular_haversine(lat, lng, float(vaga['latitude']), float(vaga['longitude']))
                if dist > raio_km:
                    continue
                    
            resultado.append({
                "id": vaga["id"],
                "titulo": vaga["titulo"],
                "area": vaga["area"],
                "contrato": vaga["contrato"],
                "empresa": {"id": vaga["empresa_id"], "nome": vaga["empresa_nome"]},
                "bairro": {"id": vaga["bairro_id"], "nome": vaga["bairro_nome"]},
                "distanciaKm": dist
            })

        return jsonify({"total": len(resultado), "itens": resultado}), 200
    except Exception:
        return jsonify({'erro': 'Erro interno ao buscar vagas.'}), 500


@vagas_bp.route('/vagas/<int:vaga_id>', methods=['GET'])
@token_opcional
def detalhar_vaga(vaga_id):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT v.id, v.titulo, v.descricao, v.requisitos, v.area, v.contrato, 
                           v.regime, v.turno, v.salario, v.status,
                           e.usuario_id AS empresa_id, e.nome AS empresa_nome,
                           b.id AS bairro_id, b.nome AS bairro_nome
                    FROM vagas v
                    JOIN empresas e ON v.empresa_id = e.usuario_id
                    JOIN bairros b ON v.bairro_id = b.id
                    WHERE v.id = %s;
                """, (vaga_id,))
                vaga = cur.fetchone()

                if not vaga:
                    return jsonify({"erro": "Vaga não encontrada."}), 404

                minha_candidatura = None
                if request.usuario_logado and request.usuario_logado.get('perfil') == 'candidato':
                    cur.execute("""
                        SELECT id, status FROM candidaturas 
                        WHERE vaga_id = %s AND candidato_id = %s;
                    """, (vaga_id, request.usuario_logado['id']))
                    cand = cur.fetchone()
                    if cand:
                        minha_candidatura = {"id": cand['id'], "status": cand['status']}

        return jsonify({
            "id": vaga["id"],
            "titulo": vaga["titulo"],
            "descricao": vaga["descricao"],
            "requisitos": vaga["requisitos"],
            "area": vaga["area"],
            "contrato": vaga["contrato"],
            "regime": vaga["regime"],
            "turno": vaga["turno"],
            "salario": float(vaga["salario"]) if vaga["salario"] else None,
            "status": vaga["status"],
            "empresa": {"id": vaga["empresa_id"], "nome": vaga["empresa_nome"]},
            "bairro": {"id": vaga["bairro_id"], "nome": vaga["bairro_nome"]},
            "minhaCandidatura": minha_candidatura
        }), 200
    except Exception:
        return jsonify({'erro': 'Erro interno ao detalhar vaga.'}), 500


@vagas_bp.route('/vagas', methods=['POST'])
@token_requerido
def criar_vaga():
    usuario = request.usuario_logado
    if usuario['perfil'] != 'empresa':
        return jsonify({'erro': 'Apenas empresas podem criar vagas.'}), 403

    data = request.get_json() or {}
    titulo = data.get('titulo', '')
    descricao = data.get('descricao', '')
    requisitos = data.get('requisitos', '')
    area = str(data.get('area', '')).lower()
    contrato = str(data.get('contrato', '')).lower()
    regime = str(data.get('regime', '')).lower()
    turno = str(data.get('turno', '')).lower()
    bairro_id = data.get('bairroId')
    salario = data.get('salario')

    if not isinstance(titulo, str) or not isinstance(descricao, str):
        return jsonify({'erro': 'Título e descrição devem ser textos válidos.'}), 400

    if not titulo or not descricao or not requisitos or not area or not contrato or not regime or not turno or not bairro_id:
        return jsonify({'erro': 'Todos os campos obrigatórios de vaga devem ser preenchidos.'}), 400
        
    if len(titulo) < 5:
        return jsonify({'erro': 'O título deve conter no mínimo 5 caracteres.'}), 400
    if len(descricao) < 20:
        return jsonify({'erro': 'A descrição deve conter no mínimo 20 caracteres.'}), 400
    if not requisitos or not bairro_id:
        return jsonify({'erro': 'Requisitos e bairroId são obrigatórios.'}), 400
    if area not in AREAS_VALIDAS or contrato not in CONTRATOS_VALIDOS or regime not in REGIMES_VALIDOS or turno not in TURNOS_VALIDOS:
        return jsonify({'erro': 'Valores de área, contrato, regime ou turno inválidos.'}), 400

    try:
        bairro_id_int = int(bairro_id)
    except (ValueError, TypeError):
        return jsonify({'erro': 'O campo bairroId deve ser um número inteiro válido.'}), 400

    salario_float = None
    if salario is not None:
        try:
            salario_float = float(salario)
            if salario_float <= 0:
                return jsonify({'erro': 'O salário deve ser maior que zero ou nulo.'}), 400
        except (ValueError, TypeError):
            return jsonify({'erro': 'O salário deve ser um valor numérico válido.'}), 400

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO vagas (empresa_id, titulo, descricao, requisitos, area, contrato, regime, turno, bairro_id, salario, status)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'aberta')
                    RETURNING id;
                """, (usuario['id'], titulo, descricao, requisitos, area, contrato, regime, turno, bairro_id_int, salario_float))
                vaga_id = cur.fetchone()['id']
                conn.commit()

        return jsonify({"id": vaga_id, "status": "aberta", "mensagem": "Vaga criada com sucesso!"}), 201
    except Exception as e:
        if 'violates foreign key' in str(e):
             return jsonify({'erro': 'Bairro informado é inválido.'}), 400
        return jsonify({'erro': 'Erro interno ao criar vaga.'}), 500


@vagas_bp.route('/vagas/<int:vaga_id>', methods=['PUT'])
@token_requerido
def atualizar_vaga(vaga_id):
    usuario = request.usuario_logado
    if usuario['perfil'] != 'empresa':
        return jsonify({'erro': 'Acesso negado.'}), 403

    data = request.get_json() or {}
    titulo = data.get('titulo', '')
    descricao = data.get('descricao', '')
    requisitos = data.get('requisitos', '')
    area = str(data.get('area', '')).lower()
    contrato = str(data.get('contrato', '')).lower()
    regime = str(data.get('regime', '')).lower()
    turno = str(data.get('turno', '')).lower()
    bairro_id = data.get('bairroId')
    salario = data.get('salario')
    status = str(data.get('status', '')).lower()

    if len(titulo) < 5 or len(descricao) < 20 or not requisitos or not bairro_id:
        return jsonify({'erro': 'Dados obrigatórios inválidos.'}), 400
    if area not in AREAS_VALIDAS or contrato not in CONTRATOS_VALIDOS or regime not in REGIMES_VALIDOS or turno not in TURNOS_VALIDOS or status not in STATUS_VAGA_VALIDOS:
        return jsonify({'erro': 'Valores de enumeração inválidos fornecidos.'}), 400

    try:
        bairro_id_int = int(bairro_id)
    except (ValueError, TypeError):
        return jsonify({'erro': 'O campo bairroId deve ser um número inteiro válido.'}), 400

    salario_float = None
    if salario is not None:
        try:
            salario_float = float(salario)
            if salario_float <= 0:
                return jsonify({'erro': 'O salário deve ser maior que zero ou nulo.'}), 400
        except (ValueError, TypeError):
            return jsonify({'erro': 'O salário deve ser um valor numérico válido.'}), 400

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT empresa_id FROM vagas WHERE id = %s;", (vaga_id,))
                vaga = cur.fetchone()
                
                if not vaga:
                    return jsonify({"erro": "Vaga não encontrada."}), 404
                if vaga['empresa_id'] != usuario['id']:
                    return jsonify({'erro': 'Sua empresa não tem permissão para alterar esta vaga.'}), 403

                cur.execute("""
                    UPDATE vagas 
                    SET titulo = %s, descricao = %s, requisitos = %s, area = %s, contrato = %s, 
                        regime = %s, turno = %s, bairro_id = %s, salario = %s, status = %s
                    WHERE id = %s;
                """, (titulo, descricao, requisitos, area, contrato, regime, turno, bairro_id_int, salario_float, status, vaga_id))
                conn.commit()

        return jsonify({"mensagem": "Vaga atualizada com sucesso."}), 200
    except Exception:
        return jsonify({'erro': 'Erro interno ao atualizar vaga.'}), 500


@vagas_bp.route('/empresa/vagas', methods=['GET'])
@token_requerido
def painel_empresa_vagas():
    usuario = request.usuario_logado
    if usuario['perfil'] != 'empresa':
        return jsonify({'erro': 'Acesso negado.'}), 403

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT COUNT(*) AS abertas FROM vagas WHERE empresa_id = %s AND status = 'aberta';", (usuario['id'],))
                vagas_abertas = cur.fetchone()['abertas']

                cur.execute("""
                    SELECT COUNT(*) AS total 
                    FROM candidaturas c
                    JOIN vagas v ON c.vaga_id = v.id
                    WHERE v.empresa_id = %s;
                """, (usuario['id'],))
                total_candidaturas = cur.fetchone()['total']

                cur.execute("""
                    SELECT v.id, v.titulo, v.status, v.criado_em,
                           (SELECT COUNT(*) FROM candidaturas c WHERE c.vaga_id = v.id) AS qtd_candidaturas
                    FROM vagas v
                    WHERE v.empresa_id = %s
                    ORDER BY v.criado_em DESC;
                """, (usuario['id'],))
                vagas = cur.fetchall()

        itens = []
        for v in vagas:
            itens.append({
                "id": v['id'],
                "titulo": v['titulo'],
                "status": v['status'],
                "qtdCandidaturas": v['qtd_candidaturas'],
                "dataCriacao": v['criado_em'].isoformat()
            })

        return jsonify({
            "vagasAbertas": vagas_abertas,
            "totalCandidaturas": total_candidaturas,
            "itens": itens
        }), 200
    except Exception:
        return jsonify({'erro': 'Erro interno ao buscar painel de vagas.'}), 500
    