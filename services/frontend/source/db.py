import os
from peewee import MySQLDatabase


CONFIG = {
    'host': os.environ.get('MYSQL_HOST'),
    'db': os.environ.get('MYSQL_DATABASE'),
    'user': os.environ.get('MYSQL_USER'),
    'passwd': os.environ.get('MYSQL_PASSWORD')
}

def get_database():
    db = MySQLDatabase(CONFIG['db'], **{i: CONFIG[i] for i in CONFIG if i != 'db'})
    return db

def query(sql, params=None, require_commit=False):
    database = get_database()
    database.connect()
    cursor = database.execute_sql(sql, params, require_commit)
    column_names = [d[0] for d in cursor.description]
    data = []
    for d in cursor.fetchall():
        data.append(dict(zip(column_names, d)))
    database.close()
    return data
