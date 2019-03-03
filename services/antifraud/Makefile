SHELL := /bin/bash
.PHONY: build dev run altrun clean

source/target:
	cd source && mvn package

dev: run
	echo PENDIENTE

clean:
	cd source && mvn dependency:purge-local-repository
	rm -rf source/target
	docker rmi -f antifraud

build:
	docker build -t antifraud .

run: build
	docker run -it --rm -p 8080:8080 --name antifraud \
		-e CATALINA_OPTS="-Dcom.sun.management.jmxremote \
			-Dcom.sun.management.jmxremote.port=9000 \
			-Dcom.sun.management.jmxremote.ssl=false \
			-Dcom.sun.management.jmxremote.authenticate=false" \
		antifraud

altrun: build
	docker run -it --rm -p 8080:8080 --name antifraud \
		-e JAVA_OPTS="-javaagent:/usr/local/tomcat/newrelic/newrelic.jar \
			-Dnewrelic.config.license_key=90cbf5bcdfc82b765cca853b645201c6fe0a562e \
			-Dnewrelic.config.app_name='Antifraud Tomcat' \
			-Dnewrelic.config.distributed_tracing.enabled=true" \
		antifraud 
