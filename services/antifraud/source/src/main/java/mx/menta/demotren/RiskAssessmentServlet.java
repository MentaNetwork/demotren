package mx.menta.demotren;

import com.google.gson.Gson;
import com.newrelic.api.agent.NewRelic;
import com.newrelic.api.agent.Trace;
import java.io.IOException;
import java.io.PrintWriter;
import java.lang.Thread;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.HashMap;
import java.util.Random;
import java.util.stream.Collectors;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import mx.menta.demotren.PaymentIntentForRiskAssessmentRequest;


@WebServlet(name = "RiskAssessmentServlet", urlPatterns = { "/evaluate-payment-intent" }, loadOnStartup = 1)
public class RiskAssessmentServlet extends HttpServlet {
  private static final long serialVersionUID = -1234567890987654321L;

  protected static final Integer MAX_AMOUNT_CENTS = 10000000; // 100k
  protected static final String STATUS_CONTINUE = "antifraud:continue";
  protected static final String STATUS_STOP = "antifraud:stop";
  protected static final String STATUS_ERROR = "antifraud:error";

  protected static final String ORACLE_USER = System.getenv("ORACLE_USER");
  protected static final String ORACLE_PASSWORD = System.getenv("ORACLE_PASSWORD");
  protected static final String ORACLE_URL = "jdbc:oracle:thin:@" + System.getenv("ORACLE_HOST") + ":1521:"
      + System.getenv("ORACLE_SERVICE");

  //////////////////////////////////////////////////////////////
  //// Manejo HTTP

  @Trace
  protected HttpServletResponse updateHeaders(HttpServletResponse response) {
    // Armamos y devolvemos la respuesta
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Requested-With");
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    // Encabezado para saber el nombre del host que sirve la respuesta
    try {
      response.setHeader("X-From-Host", java.net.InetAddress.getLocalHost().getHostName());
    } catch (Exception e) {}
    return response;
  }

  @Override
  protected void doOptions(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    response = updateHeaders(response);
    super.doOptions(request, response);
  }

  @Override
  protected void doPost(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    response = updateHeaders(response);
    processRequest(request, response);
  }

  @Trace
  protected void processRequest(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {

    // Obtenemos las variables recibidas en la solicitud JSON
    String jsonBody = request.getReader().lines().collect(
        Collectors.joining(System.lineSeparator()));
    PaymentIntentForRiskAssessmentRequest jsonRequest = new Gson().fromJson(jsonBody,
        PaymentIntentForRiskAssessmentRequest.class);

    // Estas son todas las variables críticas de esta transacción
    String transactionId = jsonRequest.transactionId;
    String token = jsonRequest.token;
    int amount = Integer.parseInt(jsonRequest.amount);
    String date = "";
    int riskScore = 0;
    String status = "";
    int delay = waitRandomTime();

    // Aquí interactuamos con la base de datos
    try {
      date = getDateFromDatabase();
      // Cálculo de riesgo con error lógico
      for (int i = 0; i <= new Random().nextInt(150); i++) {
        riskScore = getRiskScore(token, amount);
      }
      status = evaluatePaymentIntent(riskScore, amount);
    } catch (SQLException e) {
      status = STATUS_ERROR;
      NewRelic.noticeError(e.getMessage());
    }

    // New Relic - Custom Event
    HashMap<String, Object> customAttributes = new HashMap<String, Object>();
    customAttributes.put("transactionId", transactionId);
    customAttributes.put("token", token);
    customAttributes.put("amount", amount);
    customAttributes.put("riskScore", riskScore);
    customAttributes.put("status", status);
    customAttributes.put("delay", delay);
    String customEventName = "AntifraudRiskAssessmentEvaluation";
    NewRelic.getAgent().getInsights().recordCustomEvent(customEventName, customAttributes);

    // New Relic - Custom Attributes
    NewRelic.addCustomParameter("transactionId", transactionId);
    NewRelic.addCustomParameter("token", token);
    NewRelic.addCustomParameter("amount", amount);
    NewRelic.addCustomParameter("riskScore", riskScore);
    NewRelic.addCustomParameter("status", status);
    NewRelic.addCustomParameter("delay", delay);

    // New Relic - Custom Metric
    NewRelic.recordResponseTimeMetric("Custom/AntifraudRiskAssessmentEvaluation/Delay", delay);

    try {
      PrintWriter out = response.getWriter();
      out.println("{"
          + "\"success\":\"true\"," 
          + "\"date\":\"" + date + "\","
          + "\"transactionId\":\"" + transactionId + "\","
          + "\"status\":\"" + status + "\","
          + "\"riskScore\":\"" + Integer.toString(riskScore) + "\","
          + "\"delay\":\"" + Integer.toString(delay) + "\""
          + "}");
    } catch (Exception e) {
      NewRelic.noticeError(e.getMessage());
      response.sendError(500, e.toString());
    }
  }

  //////////////////////////////////////////////////////////////
  //// Métodos utilitarios

  protected Connection getOracleConnection() {
    Connection c = null;
    try {
      DriverManager.registerDriver(new oracle.jdbc.driver.OracleDriver());
      c = DriverManager.getConnection(ORACLE_URL, ORACLE_USER, ORACLE_PASSWORD);
    } catch (SQLException e) {
      NewRelic.addCustomParameter("ORACLE_URL", ORACLE_URL);
      NewRelic.addCustomParameter("ORACLE_USER", ORACLE_USER);
      NewRelic.noticeError(e.getMessage());
      e.printStackTrace();
    }
    return c;
  }

  @Trace
  protected int waitRandomTime() {
    int delay = 0;
    try {
      delay = new Random().nextInt(600);
      Thread.sleep(delay);
    } catch (Exception e) {
      delay = 0;
    }
    return delay;
  }

  @Trace
  protected String getDateFromDatabase() throws SQLException {
    String currentDate = "UNKNOWN";
    Connection con = getOracleConnection();
    Statement stmt = con.createStatement();
    ResultSet rs = stmt.executeQuery("SELECT SYSDATE FROM DUAL");
    if (rs.next()) {
      currentDate = rs.getString(1);
    }
    rs.close();
    stmt.close();
    con.close();
    return currentDate;
  }

  @Trace
  protected Integer getRiskScore(String token, Integer amount) throws SQLException {
    // Se vereifica la tarjeta: activa, robada, etc
    if (!isValidCard(token)) {
      return 0;
    }

    // Generamos el score de riesgo
    int score = new Random().nextInt(10);

    // ( Simulamos sacarlo de la base de datos )
    Connection con = getOracleConnection();
    Statement stmt = con.createStatement();
    ResultSet rs = stmt.executeQuery(
        "SELECT /* CÁLCULO DE RIESGO CON TOKEN Y CANTIDAD */ SYSDATE FROM DUAL");
    while (rs.next()) {
      rs.getString(1);
    }
    rs.close();
    stmt.close();
    con.close();
    return score;
  }

  // No @Trace here to instrument manually
  protected Boolean isValidCard(String token) {
    Boolean isValid = true;
    waitRandomTime();
    try {
      Connection con = getOracleConnection();
      Statement stmt = con.createStatement();
      ResultSet rs = stmt.executeQuery(
          "SELECT /* CONSULTA DE TARJETA CON BASE EN TOKEN */ SYSDATE FROM DUAL");
      while (rs.next()) {
        rs.getString(1);
      }
      rs.close();
      stmt.close();
      con.close();
    } catch (SQLException e) {
      NewRelic.noticeError(e.getMessage());
      isValid = false;
    }
    return isValid;
  }

  @Trace
  protected String evaluatePaymentIntent(int riskScore, int amount) {
    // Alto riesgo
    if (riskScore < 3) {
      return STATUS_STOP;
    }
    // Cantidad muy alta
    if (amount > MAX_AMOUNT_CENTS) {
      return STATUS_STOP;
    }
    // Por default se acepta
    return STATUS_CONTINUE;
  }

}
