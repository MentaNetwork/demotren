FROM ubuntu:16.04

ENV UWSGI_WORKERS=4 \
    FLASK_DEBUG=1 \
    LOG_LEVEL=DEBUG \
    PYTHONPATH=$PYTHONPATH:/app

RUN apt-get update && apt-get install -y \
    locales \
    curl \
    nginx-full \
    python3 \
    python3-pip \
    supervisor \
    uwsgi \
    uwsgi-plugin-python3 \
    vim \
    mysql-client \
    libmysqlclient-dev && \
    rm -rf /var/lib/apt/lists/*

COPY source/requirements.txt /app/requirements.txt
RUN pip3 install -r /app/requirements.txt

COPY docker/supervisor.conf /etc/supervisor/conf.d/supervisor.conf
COPY docker/nginx.conf /etc/nginx/sites-available/nginx.conf
COPY docker/uwsgi.ini /etc/uwsgi/apps-available/uwsgi.ini

RUN mkdir -p /var/log/nginx/app && \
    mkdir -p /var/log/uwsgi/app && \
    mkdir -p /var/log/supervisor && \
    rm /etc/nginx/sites-enabled/default && \
    ln -s /etc/nginx/sites-available/nginx.conf /etc/nginx/sites-enabled/ && \
    ln -s /etc/uwsgi/apps-available/uwsgi.ini /etc/uwsgi/apps-enabled/ && \
    echo "daemon off;" >> /etc/nginx/nginx.conf && \
    locale-gen es_MX.UTF-8

COPY source /app

WORKDIR /app/

EXPOSE 80

CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisor.conf"]