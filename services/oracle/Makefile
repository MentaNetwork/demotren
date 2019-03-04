SHELL := /bin/bash
.PHONY: build run clean

docker-oracle-xe-11g:
	git clone git@github.com:MentaNetwork/docker-oracle-xe-11g.git

clean:
	docker rmi -f oracle

build: docker-oracle-xe-11g
	cd docker-oracle-xe-11g && docker build -t local-oracle-xe-11g .
	docker build -t oracle .

run: build
	docker run -it --rm -p 1521:1521 --name oracle oracle
