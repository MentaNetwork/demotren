SHELL := /bin/bash
.PHONY: check_env dev clean build run

# Creamos el entorno virtual en la raíz del proyecto para que VS Code lo encuentre
VENV=../../venv

${VENV}: ${VENV}/bin/activate

${VENV}/bin/activate: source/requirements.txt
	test -d ${VENV} || python3 -m venv ${VENV}
	${VENV}/bin/pip install -Ur source/requirements.txt
	touch ${VENV}/bin/activate

check_env: ${VENV}
	@which python | grep `pwd` || source ${VENV}/bin/activate;


dev: check_env
	${VENV}/bin/python source/app.py

clean:
	docker rmi -f frontend

build:
	docker build -t frontend .

run: build
	docker run -it --rm -p 80:80 --name frontend frontend