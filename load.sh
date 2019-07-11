#!/bin/bash

FRONTEND='http://localhost'
API='http://localhost:8000'
CORE='http://localhost:5000'
ANTIFRAUD='http://localhost:8080'

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
    local amount=`python -c 'import random; print(random.randrange(100,2000,100))'`
    curl "$API/pay" \
        -H 'Content-Type: application/json' \
        -H 'Accept: application/json' \
        --data-binary '{"token":"TOKEN_eyJuYW1lIj","amount":"'$amount'","customerId":"ernestom@menta.com.mx","recipientId":"paletas@yahoo.mx"}'

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

simulate_antifraud() {
    curl -X POST "$ANTIFRAUD/risk-assessment-service/evaluate-payment-intent" \
        -H 'Content-type: application/json' \
        -H 'Accept: application/json' \
        --data '{"transactionId": "123", "token": "qwerty", "amount": 2340}' -v
}


while true; do
    simulate_frontend
done