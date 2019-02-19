const newrelic = require('newrelic');
const os = require('os');
const config = require('./config');


///////////////////////////////////////////////////////////////////////////////
/////// UTILIDADES
///////////////////////////////////////////////////////////////////////////////


// Crea un nuevo ID de transacción de 4 dígitos, ejemplo: 1234
function getNewTransactionId() {
  return Math.random().toPrecision(6).substr(2);
}

// Incluye encabezados necesarios en todas las respuestas
function defaultHeaders(request, response, next) {
  // Encabezados CORS para poder hacer pruebas desde editor.swagger.io
  response.header('Access-Control-Allow-Origin', '*');
  response.header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
  response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  // Encabezado para saber el nombre del host que sirve la respuesta
  response.header('X-From-Host', os.hostname());
  return next();
}

function randomChoice(items) {
  return items[~~(items.length * Math.random())];
}

function recordPaymentIntentStatus(step, transactionId, status, message) {
  const customEvent = {
    step: step,
    transactionId: transactionId,
    status: status,
    message: message
  };
  console.log(customEvent);
  newrelic.recordCustomEvent(config.PAYMENT_INTENT_EVENT_NAME, customEvent);
}

module.exports = {
  getNewTransactionId: getNewTransactionId,
  defaultHeaders: defaultHeaders,
  randomChoice: randomChoice,
  recordPaymentIntentStatus: recordPaymentIntentStatus
};
