const newrelic = require('newrelic');
const fetch = require('node-fetch');
const config = require('./config');
const utils = require('./utils');


///////////////////////////////////////////////////////////////////////////////
/////// ENDPOINTS
///////////////////////////////////////////////////////////////////////////////


//     GET /status/{transactionId}
// Función para saber el estatus de una transacción de pago
function status(req, res, next) {
  const status = utils.randomChoice(Object.values(config.PAYMENT_INTENT_STATUS));
  const response = {
    status: status,
    transactionId: req.params.transactionId
  };
  res.send(response);
  // New Relic - Custom Attributes
  newrelic.addCustomAttributes(response);
  next();
}


//     POST /tokenize
// Función para crear un token con base en datos de una tarjeta
function tokenize(req, res, next) {
  const givenYear = ('' + req.params.year).substr(2, 2);
  const currentYear = ('' + new Date().getFullYear()).substr(2, 2);
  if (givenYear < currentYear) {
    res.status(400);
    res.send({message: 'Invalid year'});
    return;
  }
  const data = JSON.stringify(req.params);
  const token = 'TOKEN_' + Buffer.from(data).toString('base64').substr(0, 10);
  res.send({y: req.params.year,
    token: token,
    status: 'ok'
  });
  next();
}


//     POST /pay
// Función para crear un intento de pago
function pay(req, res, next) {
  
  // 1. Creamos una nueva transacción
  const transactionId = utils.getNewTransactionId();
  const data = req.params;
  var status = null;
  var message = null;

  // 2. Procesamos asíncronamente el intento de pago

  // Si el intento es inválido, nos detenemos
  const invalidParameters = !data.recipientId || !data.token || !data.amount;
  const invalidAmount = data.amount < 1000 || data.amount > 10000000;
  
  // Devolvemos el aviso de que el intento de pago no puede continuar
  if (invalidParameters || invalidAmount) {
    status = config.PAYMENT_INTENT_STATUS.API_INVALID;
    message = invalidParameters ? 'Parámetros inválidos' : 'Cantidad inválida';
    res.status(400); // HTTP 400 Bad Request
    res.send({
      transactionId: transactionId,
      status: status,
      message: message
    });
    utils.recordPaymentIntentStatus('1', transactionId, status, message);
  }

  // Si el intento es válido, seguimos
  processAsyncPaymentIntent(transactionId, data);
  
  // 3. Devolvemos el aviso de que se está procesando el pago
  status = config.PAYMENT_INTENT_STATUS.API_PROCESSING;
  message = 'Enviado a procesamiento';
  res.status(202); // HTTP 202 Accepted 
  res.send({
    transactionId: transactionId,
    status: status
  });
  utils.recordPaymentIntentStatus('1', transactionId, status, message);
  next();
}


///////////////////////////////////////////////////////////////////////////////
/////// Callbacks
///////////////////////////////////////////////////////////////////////////////

function handleError(e) {
  newrelic.noticeError(e.message);
  console.log(e.message);
  throw e;
}

function processAsyncPaymentIntent(transactionId, data) {

  const jsonPayload = JSON.stringify(data);
  var params = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: jsonPayload
  };
  
  // 1. Consultamos con anti fraude
  fetch(config.ANTIFRAUD_SERVICE, params).then(function(response) {
    return response.json().catch(handleError);
  }).then(function(json) {
    const antifraudStatus = json.status;
    // 2. Actualizar el estado de la transacción
    utils.recordPaymentIntentStatus('2', transactionId, antifraudStatus, 'Procesado por Antifraude');
    updateTransactionStatus(transactionId, antifraudStatus);

    // Si el servicio anti fraude NO nos permite continuar, nos detenemos
    if (antifraudStatus == config.PAYMENT_INTENT_STATUS.ANTIFRAUD_STOP) {
      return;
    }

    // Si el servicio anti fraude SÍ nos permite continuar, seguimos
    // 3. Enviar el intento de pago al servicio core para su procesamiento
    const formPayload = Object.keys(data).map((key) => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
    }).join('&');
    var params = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formPayload
    };
    fetch(config.CORE_SERVICE, params).then(function(response) {
      return response.json().catch(handleError);
    }).then(function(json) {
      const coreStatus = json.status;
      // 4. Actualizar el estado de la transacción
      utils.recordPaymentIntentStatus('3', transactionId, coreStatus, 'Procesado por Core');
      updateTransactionStatus(transactionId, coreStatus);
    }).catch(handleError);

  }).catch(handleError);
}


function updateTransactionStatus(transactionId, status) {
  // ¿Guardar el status en la BD?
}


///////////////////////////////////////////////////////////////////////////////

module.exports = {
  status: status,
  tokenize: tokenize,
  pay: pay
};

