# Genera frontend/js/mock-data.js a partir de database/seed.sql y backend/avatar.py.
# Uso (desde la raiz del repo):  python tools/generar_mock.py
import sqlite3, re, json, sys, os
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sql = open(R + '/database/seed.sql', encoding='utf-8-sig').read()
db = sqlite3.connect(':memory:'); db.row_factory = sqlite3.Row
tables = {}
for m in re.finditer(r'INSERT INTO (\w+) \(([^)]*)\)', sql):
    t, cols = m.group(1), [c.strip() for c in m.group(2).split(',')]
    tables.setdefault(t, set()).update(cols)
for t, cols in tables.items():
    extra = [c for c in cols if c != 'id']
    pk = 'id INTEGER PRIMARY KEY, ' if t not in ('product_categories', 'product_teams') else ''
    db.execute(f'CREATE TABLE {t} ({pk}{", ".join(extra)})')
for stmt in sql.split(';\n'):
    s = stmt.strip()
    if s.startswith('INSERT'): db.execute(s)
out = {}
for t in tables:
    rows = [dict(r) for r in db.execute(f'SELECT * FROM {t}')]
    if t == 'users':
        for r in rows: r.pop('password_hash', None)
    out[t] = rows
out['races'] = [
 {"id": 1, "name": "Gran Premio de Monza", "circuit": "Autodromo Nazionale Monza", "country": "Italia", "race_date": "2026-09-06T14:00:00", "drivers": [["Charles Leclerc", "ferrari"], ["Max Verstappen", "red-bull"], ["Lando Norris", "mclaren"], ["George Russell", "mercedes"]]},
 {"id": 2, "name": "Gran Premio de Singapur", "circuit": "Marina Bay Street Circuit", "country": "Singapur", "race_date": "2026-09-20T13:00:00", "drivers": [["Oscar Piastri", "mclaren"], ["Max Verstappen", "red-bull"], ["Charles Leclerc", "ferrari"], ["Lewis Hamilton", "ferrari"]]},
 {"id": 3, "name": "Gran Premio de Las Vegas", "circuit": "Las Vegas Strip Circuit", "country": "Estados Unidos", "race_date": "2026-11-21T06:00:00", "drivers": [["Max Verstappen", "red-bull"], ["Lando Norris", "mclaren"], ["George Russell", "mercedes"], ["Carlos Sainz", "cadillac"]]},
]
# catalogo del avatar: se importa de backend/avatar.py para no duplicarlo a mano
sys.path.insert(0, R + '/backend')
import types; fake = types.ModuleType('database')
fake.db_cursor = fake.execute_query = fake.fetch_all = fake.fetch_one = None
sys.modules['database'] = fake
import avatar
out['avatar'] = {"slots": avatar.SLOTS, "catalog": avatar.CATALOG, "defaults": avatar._default_equipped()}
js = ('/* Datos de prueba (mock) generados desde database/seed.sql y backend/avatar.py.\n'
      '   No editar a mano: se regeneran con tools/generar_mock.py */\n'
      'window.PURPLE1_SEED = ' + json.dumps(out, ensure_ascii=False, indent=1) + ';\n')
open(R + '/frontend/js/mock-data.js', 'w', encoding='utf-8').write(js)
print({k: len(v) for k, v in out.items() if isinstance(v, list)}, len(out['avatar']['catalog']))
