FROM python:3.7-alpine
RUN apk --no-cache add \
    build-base

COPY ./source /app
RUN chmod +x /app/startserver.sh
WORKDIR /app

ENTRYPOINT [ "sh" ]

CMD ["startserver.sh"]