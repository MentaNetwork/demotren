SHELL := /bin/bash
.PHONY: build run clean

clean:
	docker rmi -f oracle

build:
	docker build -t oracle .

run: build
	docker run -it --rm -p 1521:1521 --name oracle oracle
