SHELL := /bin/bash
.PHONY: build run clean

clean:
	docker rmi -f mysql

build:
	echo "Pass"

run: build
	docker run -it --rm -p 3306:3306 --name mysql mysql

