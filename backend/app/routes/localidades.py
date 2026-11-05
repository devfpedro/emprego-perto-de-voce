from flask import Blueprint, jsonify
from app.db import get_db_connection

localidades_bp = Blueprint('localidades', __name__, url_prefix='/localidades')

@localidades_bp.route('', methods=['GET'])
def listar_localidades():
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id, nome FROM cidades ORDER BY nome;")
                cidades = cur.fetchall()
                
                for cidade in cidades:
                    cur.execute("""
                        SELECT id, nome, latitude, longitude 
                        FROM bairros 
                        WHERE cidade_id = %s 
                        ORDER BY nome;
                    """, (cidade['id'],))
                    cidade['bairros'] = cur.fetchall()
                    for bairro in cidade['bairros']:
                        bairro['latitude'] = float(bairro['latitude'])
                        bairro['longitude'] = float(bairro['longitude'])

        return jsonify(cidades), 200
    except Exception:
        return jsonify({'erro': 'Erro interno ao buscar localidades.'}), 500