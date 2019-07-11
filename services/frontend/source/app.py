# New Relic - Inicialización temprana
from os import path, environ
import newrelic.agent

nr_config = path.join(path.dirname(path.abspath(__file__)), 'newrelic.ini')
newrelic.agent.initialize(nr_config, 'production')


import time
import random
from werkzeug.debug import DebuggedApplication
from flask import (
    Flask,
    request,
    session,
    redirect,
    url_for,
    render_template)
from db import query


app = Flask(__name__)
app.secret_key = environ.get('SECRET_KEY')
app.wsgi_app = DebuggedApplication(app.wsgi_app, True)


###############################################################################
## Funciones

def get_available_amounts():
    # Cifras de ejemplo
    data = query("""
    SELECT "10" UNION ALL 
    SELECT "100" UNION ALL
    SELECT "200" UNION ALL
    SELECT "500" UNION ALL
    SELECT "150000"
    """)
    return data

def is_valid_login(email, password):
    # Validación
    form_was_filled = bool(email and password)
    valid_login = email.endswith('@menta.com.mx') and password == '1234'
    banned_domain = email.endswith('@yahoo.com')
    
    if banned_domain:
        time.sleep(35)

    # New Relic - Custom Attributes
    newrelic.agent.add_custom_parameter('FormWasFilled', form_was_filled)
    newrelic.agent.add_custom_parameter('ValidLogin', valid_login)
    newrelic.agent.add_custom_parameter('BannedDomain', banned_domain)
    newrelic.agent.add_custom_parameter('Email', email)

    return form_was_filled and valid_login and not banned_domain

###############################################################################
## Manejo HTTP

@app.after_request
def after_request(response):
    response.headers['X-From-Host'] = environ.get('HOSTNAME')
    return response

@app.route('/', methods=['GET', 'POST'])
def index():
    error = None
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        if is_valid_login(email, password):
            session['email'] = email
            return redirect(url_for('payment_form'))
        else:
            error = 'Acceso denegado'
    return render_template('index.html', **{'error': error})

@app.route('/ventanilla')
def payment_form():
    # if not session.get('email'):
    #     return redirect(url_for('index'))
    if random.randint(1, 10) > 7:
        time.sleep(random.randint(2, 6))

    amounts = get_available_amounts()
    amounts = [int(list(a.values())[0]) for a in amounts]
    return render_template('payment-form.html', **{'amounts': amounts})


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)