SHELL := /bin/bash
.PHONY: build run clean

dev: build
	echo PENDIENTE

clean:
	docker rmi -f core

build:
	docker build -t core .

run: build
	docker run -it --rm -p 5000:5000 --name core core

