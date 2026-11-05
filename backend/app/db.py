import os
import psycopg
from psycopg.rows import dict_row

def get_db_connection():
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        raise ValueError("DATABASE_URL não configurada no arquivo .env")
    
    conn = psycopg.connect(db_url, row_factory=dict_row)
    return conn