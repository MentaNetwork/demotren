SHELL := /bin/bash
.PHONY: build dev run altrun clean

source/target:
	cd source && mvn package

dev: run
	echo PENDIENTE

clean:
	cd source && command -v mvn && mvn dependency:purge-local-repository
	docker rmi -f antifraud

build:
	docker build -t antifraud .

run: build
	grep RELIC ../../.env | awk -F '=' '{print $$2}' > NEW_RELIC_LICENSE_KEY.txt
	docker run -it --rm -p 8080:8080 --name antifraud \
		-e CATALINA_OPTS="-Dcom.sun.management.jmxremote \
			-Dcom.sun.management.jmxremote.port=9000 \
			-Dcom.sun.management.jmxremote.ssl=false \
			-Dcom.sun.management.jmxremote.authenticate=false" \
		-e JAVA_OPTS="-javaagent:/usr/local/tomcat/newrelic/newrelic.jar \
			-Dnewrelic.config.license_key="`cat NEW_RELIC_LICENSE_KEY.txt`" \
			-Dnewrelic.config.app_name='Antifraud Tomcat' \
			-Dnewrelic.config.distributed_tracing.enabled=true" \
		antifraud
