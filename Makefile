SHELL := /bin/bash
.PHONY: build dev run clean

dev:
	docker-compose up --build

clean:
	rm -rf services/docker-oracle-xe-11g
	cd services && git clone https://github.com/wnameless/docker-oracle-xe-11g.git
	cd services/mysql && make clean
	cd services/oracle && make clean
	cd services/frontend && make clean
	cd services/antifraud && make clean
	cd services/core && make clean
	cd services/api && make clean

build: clean
	cd services/docker-oracle-xe-11g && docker build -t local-oracle-xe-11g .
	cd services/mysql && make build
	cd services/oracle && make build
	cd services/frontend && make build
	cd services/antifraud && make build
	cd services/core && make build
	cd services/api && make build

run:
	docker-compose up --build
