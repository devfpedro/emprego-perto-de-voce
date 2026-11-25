import math
from flask import request
from werkzeug.exceptions import BadRequest, UnsupportedMediaType


def calcular_haversine(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = (
        math.sin(dlat / 2) ** 2 +
        math.cos(math.radians(lat1)) *
        math.cos(math.radians(lat2)) *
        math.sin(dlon / 2) ** 2
    )

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


def obter_json_objeto():
    try:
        data = request.get_json()
    except (BadRequest, UnsupportedMediaType):
        return None, (
            {"erro": "O corpo da requisição deve conter um JSON válido."},
            400
        )

    if not isinstance(data, dict):
        return None, (
            {"erro": "O JSON enviado deve ser um objeto."},
            400
	)

    return data, None

