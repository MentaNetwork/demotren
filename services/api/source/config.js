

module.exports = {

    ANTIFRAUD_SERVICE:           'http://antifraud:8080/risk-assessment-service/evaluate-payment-intent',
    CORE_SERVICE:                'http://core:5000/core/PaymentProcessor',

    PAYMENT_INTENT_STATUS: {
        API_PROCESSING:          'api:processing',
        API_INVALID:             'api:invalid',
        ANTIFRAUD_CONTINUE:      'antifraud:continue',
        ANTIFRAUD_STOP:          'antifraud:stop',
        CORE_DECLINED:           'core:declined',
        CORE_INSUFFICIENT_FUNDS: 'core:insufficient_funds',
        CORE_INVALID:            'core:invalid',
        CORE_PROCESSED:          'core:processed'
    },

    PAYMENT_INTENT_EVENT_NAME: 'PaymentIntent'
};