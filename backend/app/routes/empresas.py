from flask import Blueprint, request, jsonify
from app.utils import calcular_haversine
from app.db import get_db_connection

empresas_bp = Blueprint('empresas', __name__, url_prefix='/empresas')

@empresas_bp.route('', methods=['GET'])
def listar_empresas():
    q = request.args.get('q', '').lower()
    area = request.args.get('area', '').lower()
    lat = request.args.get('lat', type=float)
    lng = request.args.get('lng', type=float)
    raio_km = request.args.get('raioKm', default=10, type=float)

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                query = """
                    SELECT e.usuario_id, e.nome, e.setor, 
                           b.id AS bairro_id, b.nome AS bairro_nome, b.latitude, b.longitude,
                           (SELECT COUNT(*) FROM vagas v WHERE v.empresa_id = e.usuario_id AND v.status = 'aberta') AS qtd_vagas
                    FROM empresas e
                    JOIN bairros b ON e.bairro_id = b.id
                    WHERE 1=1
                """
                params = []
                
                if q:
                    query += " AND LOWER(e.nome) LIKE %s"
                    params.append(f"%{q}%")
                if area:
                    query += " AND e.setor = %s"
                    params.append(area)
                    
                cur.execute(query, params)
                empresas = cur.fetchall()

        resultado = []
        for emp in empresas:
            dist = 0.0
            if lat is not None and lng is not None:
                dist = calcular_haversine(lat, lng, float(emp['latitude']), float(emp['longitude']))
                if dist > raio_km:
                    continue
                    
            resultado.append({
                "id": emp['usuario_id'],
                "nome": emp['nome'],
                "setor": emp['setor'],
                "qtdVagasAbertas": emp['qtd_vagas'],
                "bairro": {
                    "id": emp['bairro_id'],
                    "nome": emp['bairro_nome'],
                    "latitude": float(emp['latitude']),
                    "longitude": float(emp['longitude'])
                }
            })

        return jsonify(resultado), 200
    except Exception:
        return jsonify({'erro': 'Erro interno ao buscar empresas.'}), 500

@empresas_bp.route('/<int:empresa_id>', methods=['GET'])
def detalhar_empresa(empresa_id):
    lat = request.args.get('lat', type=float)
    lng = request.args.get('lng', type=float)

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT e.usuario_id, e.nome, e.setor, e.descricao, u.telefone, e.site,
                           b.nome AS bairro_nome, b.latitude, b.longitude
                    FROM empresas e
                    JOIN usuarios u ON e.usuario_id = u.id
                    JOIN bairros b ON e.bairro_id = b.id
                    WHERE e.usuario_id = %s;
                """, (empresa_id,))
                empresa = cur.fetchone()

                if not empresa:
                    return jsonify({"erro": "Empresa não encontrada."}), 404

                cur.execute("""
                    SELECT id, titulo, contrato, salario
                    FROM vagas
                    WHERE empresa_id = %s AND status = 'aberta';
                """, (empresa_id,))
                vagas = cur.fetchall()

        distancia = 0.0
        if lat is not None and lng is not None:
            distancia = calcular_haversine(lat, lng, float(empresa['latitude']), float(empresa['longitude']))

        vagas_abertas = []
        for v in vagas:
            vagas_abertas.append({
                "id": v['id'],
                "titulo": v['titulo'],
                "contrato": v['contrato'],
                "salario": float(v['salario']) if v['salario'] else None
            })

        detalhes = {
            "id": empresa['usuario_id'],
            "nome": empresa['nome'],
            "setor": empresa['setor'],
            "descricao": empresa['descricao'],
            "telefone": empresa['telefone'],
            "site": empresa['site'],
            "bairro": empresa['bairro_nome'],
            "distanciaKm": distancia,
            "vagasAbertas": vagas_abertas
        }
        return jsonify(detalhes), 200

    except Exception:
        return jsonify({'erro': 'Erro interno ao detalhar empresa.'}), 500