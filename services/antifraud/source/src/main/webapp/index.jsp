<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ page import="java.util.Date" %>
<!DOCTYPE html>
<html>
  <head>
    <title><%= request.getSession().getServletContext().getServletContextName() %></title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body>
    <h2><%= request.getSession().getServletContext().getServletContextName() %></h2>
    <p><%= new Date() %></p>
    <hr/>
    <small>&copy; www.datanerds.mx / www.menta.com.mx / ayuda@menta.com.mx</small>
  </body>
</html>
