#!/bin/bash

FRONTEND='http://localhost'
API='http://localhost:8000'
CORE='http://localhost:5000'

simulate_frontend() {
    # Login
    curl $FRONTEND -I

    curl $FRONTEND --silent --output /dev/null \
        -H 'Content-Type: application/x-www-form-urlencoded' \
        --data 'email=cosmo%40menta.com.mx&password=9999'

    curl $FRONTEND --silent --output /dev/null -L \
        -H 'Content-Type: application/x-www-form-urlencoded' \
        --data 'email=cosmo%40menta.com.mx&password=1234'

    # Create payment intent from GUI
    curl "$FRONTEND/ventanilla" -I 

    # Tokenize card
    curl "$API/tokenize" \
        -H 'Content-Type: application/json' \
        -H 'Accept: application/json' \
        --data-binary '{"name":"ernesto@menta.com.mx","number":"5500000000000004","month":"3","year":"2021","cvc":"590"}'

    # Send Payment intent
    curl "$API/pay" \
        -H 'Content-Type: application/json' \
        -H 'Accept: application/json' \
        --data-binary '{"token":"TOKEN_eyJuYW1lIj","amount":"20000","customerId":"ernestom@menta.com.mx","recipientId":"paletas@yahoo.mx"}'

    # Send Payment
    curl -X POST "$CORE/core/PaymentProcessor" \
        -H 'Content-Type: application/x-www-form-urlencoded'  \
        -H 'Accept: application/json' --data 'token=TOKEN&amount=13000&transactionId=1213' -v

    # Request Status
    curl "$API/status/1234" \
        -H 'Content-Type: application/json' \
        -H 'Accept: application/json'
    
    sleep 1
}

while True; do
    simulate_frontend
done