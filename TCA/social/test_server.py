import json, os, sys, time
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent))
import tca_server

# A .env is required to boot. Make a throwaway one for the test run so the
# suite never depends on (or touches) real credentials.
from pathlib import Path
import secrets, tempfile
from werkzeug.security import generate_password_hash
if not (Path(tca_server.BASE) / '.env').exists():
    os.environ.setdefault('TCA_SECRET_KEY', secrets.token_urlsafe(48))
    os.environ.setdefault('TCA_ADMIN_USERNAME', 'TCAsocial')
    os.environ.setdefault('TCA_ADMIN_PASSWORD_HASH', generate_password_hash('admingbm'))
    os.environ.setdefault('TCA_COOKIE_SECURE', '0')
    print('  (running against throwaway test credentials, not .env)')

app = tca_server.build_app()
app.config.update(TESTING=True)

P = F = 0
def t(name, cond, extra=''):
    global P, F
    if cond: P += 1; print('  PASS ' + name)
    else:    F += 1; print('  FAIL ' + name + ('  ' + str(extra) if extra else ''))

def client():
    return app.test_client()

def login(c, u='TCAsocial', p='admingbm'):
    return c.post('/api/login', json={'username': u, 'password': p})

print('\n1. Unauthenticated requests reveal nothing')
c = client()
r = c.get('/app')
t('GET /app redirects', r.status_code == 302, r.status_code)
t('  to the login page', r.headers.get('Location', '').endswith('/'), r.headers.get('Location'))
t('  body carries no template markup', b'class="tpl"' not in r.data)
t('  body carries no headline copy', b'Nobody starts' not in r.data)
r = c.get('/assets/TCA-facebook-1200x630.psd')
t('PSD download blocked', r.status_code == 302, r.status_code)
t('  and returns no PSD bytes', b'8BPS' not in r.data)
t('/views/app.html not routable', c.get('/views/app.html').status_code in (302, 404))
t('/.env not routable', c.get('/.env').status_code in (302, 404))
t('/static/../.env blocked', c.get('/static/../.env').status_code in (302, 404))
t('favicon stays public', c.get('/static/favicon-32.png').status_code == 200)
t('logout without session → 401', c.post('/api/logout').status_code == 401)

print('\n2. Nothing secret is reachable over HTTP')
body = c.get('/').data.decode()
for word in ['admingbm', 'TCAsocial', 'scrypt', 'PASSWORD_HASH', 'SECRET_KEY', 'sha256']:
    t(f'  login page lacks {word!r}', word not in body)
t('  login page has no hash-like 64-hex string',
  not __import__('re').search(r'\b[0-9a-f]{64}\b', body))

print('\n3. Failed sign-ins')
c = client()
r = login(c, 'TCAsocial', 'wrong')
t('wrong password → 401', r.status_code == 401, r.status_code)
t('  ok:false', r.get_json().get('ok') is False)
t('  no session cookie issued', 'tca_session' not in r.headers.get('Set-Cookie', ''))
r2 = login(client(), 'admin', 'admingbm')
t('wrong username → 401', r2.status_code == 401)
t('  identical message for both halves',
  r.get_json()['error'] == r2.get_json()['error'], r2.get_json())
t('empty payload → 401', client().post('/api/login', json={}).status_code == 401)
t('non-JSON body → 401', client().post('/api/login', data='x').status_code == 401)

print('\n4. Successful sign-in')
c = client()
r = login(c)
t('200', r.status_code == 200, r.status_code)
t('  ok:true', r.get_json().get('ok') is True)
t('  next points at /app', r.get_json().get('next') == '/app')
sc = r.headers.get('Set-Cookie', '')
t('  session cookie set', 'tca_session=' in sc, sc[:60])
t('  cookie is HttpOnly', 'HttpOnly' in sc, sc)
t('  cookie is SameSite=Lax', 'SameSite=Lax' in sc, sc)
t('  response body has no credentials', b'admingbm' not in r.data)

r = c.get('/app')
t('/app now returns 200', r.status_code == 200, r.status_code)
t('  all five templates present', r.data.count(b'class="tpl"') == 5, r.data.count(b'class="tpl"'))
t('  username rendered from session', b'Signed in as <b>TCAsocial</b>' in r.data)
t('  placeholders substituted', b'__USERNAME__' not in r.data and b'__CSRF_TOKEN__' not in r.data)
t('  no credentials in the page', b'admingbm' not in r.data)
page = r.data.decode('utf-8', 'replace')
t('  no scrypt hash material in the page',
  not __import__('re').search(r'scrypt:\d+:\d+:\d+\$', page))
t('  no long hex/secret blobs in the page',
  not __import__('re').search(r'\b[0-9a-f]{32,}\b', page))
t("  the only 'scrypt' mention is prose", page.count('scrypt') == 1
  and 'stored as a scrypt hash' in page, page.count('scrypt'))
t('  Cache-Control no-store', 'no-store' in r.headers.get('Cache-Control', ''), r.headers.get('Cache-Control'))
t('  X-Frame-Options DENY', r.headers.get('X-Frame-Options') == 'DENY')
t('  nosniff', r.headers.get('X-Content-Type-Options') == 'nosniff')
r = c.get('/assets/TCA-facebook-1200x630.psd')
t('PSD now downloadable', r.status_code == 200 and r.data[:4] == b'8BPS', r.status_code)
t('  sent as attachment', 'attachment' in r.headers.get('Content-Disposition', ''))
t('signed-in / redirects to /app', c.get('/').status_code == 302)

print('\n5. Logout')
csrf = __import__('re').search(rb'name="csrf-token" content="([^"]+)"', c.get('/app').data).group(1).decode()
t('CSRF token present in page', len(csrf) > 20)
t('logout without token → 403', c.post('/api/logout').status_code == 403)
t('logout with bad token → 403', c.post('/api/logout', headers={'X-CSRF-Token': 'x'}).status_code == 403)
t('still signed in after bad attempts', c.get('/app').status_code == 200)
r = c.post('/api/logout', headers={'X-CSRF-Token': csrf})
t('logout with token → 200', r.status_code == 200, r.status_code)
t('/app blocked after logout', c.get('/app').status_code == 302)
t('PSD blocked after logout', c.get('/assets/TCA-youtube-1920x1080.psd').status_code == 302)

print('\n6. Forged sessions')
c = client()
c.set_cookie('tca_session', 'eyJhdXRoIjp0cnVlfQ.fake.signature')
t('unsigned cookie rejected', c.get('/app').status_code == 302)
with client() as c2:
    with c2.session_transaction() as sess:
        sess['auth'] = True
        sess['u'] = 'someone-else'
    t('valid signature but wrong user rejected', c2.get('/app').status_code == 302)

print('\n7. Lockout')
c = client()
codes = [login(c, 'TCAsocial', 'bad%d' % i).status_code for i in range(5)]
t('first four rejected as 401', codes[:4] == [401] * 4, codes)
t('fifth trips the lockout', codes[4] == 429, codes)
r = login(c)
t('correct credentials blocked while locked', r.status_code == 429, r.status_code)
t('  lockout message mentions the wait', 'Try again in' in r.get_json()['error'], r.get_json())

print('\n%d passed, %d failed' % (P, F))
sys.exit(1 if F else 0)
