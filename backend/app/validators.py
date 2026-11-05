import re

PERFIS_VALIDOS = {'candidato', 'empresa'}
AREAS_VALIDAS = {'alimentacao', 'comercio', 'saude', 'servicos_gerais', 'educacao'}
CONTRATOS_VALIDOS = {'clt', 'meio_periodo', 'temporario', 'estagio'}
REGIMES_VALIDOS = {'presencial', 'hibrido', 'remoto'}
TURNOS_VALIDOS = {'integral', 'manha', 'tarde', 'noturno'}
STATUS_VAGA_VALIDOS = {'aberta', 'pausada', 'encerrada', 'cancelada'}
STATUS_CANDIDATURA_VALIDOS = {'enviada', 'em_analise', 'curriculo_visto', 'entrevista', 'encerrada', 'rejeitada'}

def validar_email(email):
    pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
    return bool(re.match(pattern, str(email or '')))

def validar_telefone(telefone):
    nums = re.sub(r'\D', '', str(telefone or ''))
    return len(nums) in (10, 11)

def validar_cnpj(cnpj):
    cnpj = re.sub(r'\D', '', str(cnpj or ''))
    if len(cnpj) != 14 or len(set(cnpj)) == 1:
        return False
    
    def calc_digito(digits, weights):
        soma = sum(int(d) * w for d, w in zip(digits, weights))
        resto = soma % 11
        return '0' if resto < 2 else str(11 - resto)

    w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    w2 = [6] + w1
    
    d1 = calc_digito(cnpj[:12], w1)
    d2 = calc_digito(cnpj[:12] + d1, w2)
    
    return cnpj[-2:] == d1 + d2

def validar_url(url):
    if not url:
        return True
    pattern = r'^https?:\/\/[^\s/$.?#].[^\s]*$'
    return bool(re.match(pattern, str(url)))