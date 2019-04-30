FROM tomcat

# JMX
ENV CATALINA_OPTS="-Dcom.sun.management.jmxremote \
                   -Dcom.sun.management.jmxremote.port=9000 \
                   -Dcom.sun.management.jmxremote.ssl=false \
                   -Dcom.sun.management.jmxremote.authenticate=false"

# Oracle Driver & New Relic
ENV JAVA_OPTS="-Duser.timezone=GMT -javaagent:/usr/local/tomcat/newrelic/newrelic.jar -Dnewrelic.config.app_name='Antifraud Tomcat'"

# Tomcat
COPY docker/tomcat-users.xml /usr/local/tomcat/conf/tomcat-users.xml
COPY docker/app-manager-context.xml /usr/local/tomcat/webapps/manager/META-INF/context.xml

# Aplicación principal
COPY source/target/risk-assessment-service.war /usr/local/tomcat/webapps/risk-assessment-service.war
COPY source/lib/ojdbc8.jar /usr/local/tomcat/lib/

# New Relic
COPY source/lib/newrelic /usr/local/tomcat/newrelic
