
const BASE_URL = self.location.protocol + '//' + self.location.host + ':8000';

const TOKENIZATION_SERVICE = BASE_URL + '/tokenize';
const PAYMENT_SERVICE = BASE_URL + '/pay';
const STATUS_SERVICE = BASE_URL + '/status/{transactionId}'


var customers = [
  'papitas',
  'cacahuates',
  'pepitas',
  'pistaches',
  'juguitos',
  'paletas',
  'charritos',
  'juguitos',
  'gomitas',
  'fresitas'
]
var ccNumbers = [
  '4111111111111111',
  '4012888888881881',
  '5500000000000004',
  '340000000000009',
  '5555555555554444',
  '5105105105105100',
]

function randomChoice(items) {
    return items[~~(items.length * Math.random())];
}

function LOG(text, newBlock) {
  var d = $('#console');
  var time = new Date().toTimeString().substr(0, 8);
  var currentContent = d.text().trim();
  currentContent += newBlock ? '\n' : '';
  var newContent = currentContent + '\n[' + time + '] ' + text + '\n';
  d.text(newContent);
  d.scrollTop(d.prop('scrollHeight'));
}

function fillTestData(e) {
  e.preventDefault();
  var customerId = randomChoice(customers) + '@gmail.com';
  var recipientId = randomChoice(customers) + '@yahoo.mx';
  var options = $('#amount > option');
  var amount = randomChoice(options).value;
  var cardNumber = randomChoice(ccNumbers);
  var expMonth = Math.ceil(Math.random() *  12);
  var expYear = randomChoice([20, 21, 22, 23, 24, 25]);
  var cvc = Math.random().toPrecision(3).substr(2);
  if (!$('#customerId').val()) {
    $('#customerId').val(customerId);
  }
  $('#recipientId').val(recipientId);
  $('#amount').val(amount);
  $('#cardNumber').val(cardNumber);
  $('#expMonth').val(expMonth);
  $('#expYear').val(expYear);
  $('#cvc').val(cvc);
}

function sendForm(e) {
  if ($('#simulateJsError').prop('checked')) {
    throw new Error('Error de ejemplo en formulario');
  }
  e.preventDefault();
  LOG('⇢ INICIO', true);
  tokenizeCard();
  $(this).text('Procesando...').prop('disabled', true);
}


function tokenizeCard() {
  LOG('Tokenizar tarjeta...', true);
  var jsonPayload = JSON.stringify({
    name: $('#customerId').val(),
    number: $('#cardNumber').val(),
    month: $('#expMonth').val(),
    year: '20' + $('#expYear').val(),
    cvc: $('#cvc').val()
  });
  LOG('   Tarjeta enviada: ' + jsonPayload);
  fetch(TOKENIZATION_SERVICE, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: jsonPayload
  }).then(function(response) { 
    return response.json(); 
  }).then(function(data) { 
    if (data.token && data.status == 'ok') {
      $('#token').val(data.token);
      LOG('   Token recibido: ' + data.token);
      sendPaymentIntent();
    } else {
      throw new Error(data.message);
    }
  }).catch(handleFetchError);
}

function sendPaymentIntent() {
  LOG('Enviar intención de pago con token...', true);
  var jsonPayload = JSON.stringify({
    'token': $('#token').val(),
    'amount': $('#amount').val(),
    'customerId': $('#customerId').val(),
    'recipientId': $('#recipientId').val()
  });
  LOG('   Intención enviada: ' + jsonPayload);
  fetch(PAYMENT_SERVICE, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: jsonPayload
  }).then(function(response) { 
    return response.json(); 
  }).then(function(data) { 
    if (data.status && data.transactionId) {
      $('#transactionId').val(data.transactionId);
      LOG('   Transacción: ' + data.transactionId);
      LOG('   Estatus: ' + data.status);
      setTimeout(requestPaymentStatus, 2000);
    }
  }).catch(handleFetchError);
}

function requestPaymentStatus() {
  var transactionId = $('#transactionId').val();
  LOG('Consultar estatus de la transacción...', true);
  LOG('   Transacción consultada: ' + transactionId);
  fetch(STATUS_SERVICE.replace('{transactionId}', transactionId), {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }).then(function(response) { 
    return response.json(); 
  }).then(function(data) { 
    if (data.status && data.transactionId) {
      LOG('   Transacción: ' + data.transactionId);
      LOG('   Estatus: ' + data.status);
      LOG('✔ FIN', true);
      enableForm();
      $('form')[0].reset();
    }
  }).catch(handleFetchError);
}

function enableForm() {
  $('#btnSend').text('Enviar pago').prop('disabled', false);
}

function handleFetchError(error) {
  LOG('✗ ERROR ' + error, true);
  console.log(error);
  enableForm();
}

$(document).ready(function() {
  $('#btnTest').click(fillTestData);
  $('#btnSend').click(sendForm);
});