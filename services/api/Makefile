SHELL := /bin/bash
.PHONY: build dev run clean

dev:
	cd source && npm run dev

clean:
	docker rmi -f api

build:
	docker build -t api .

run: build
	docker run -it --rm -p 8000:8000 --name api api