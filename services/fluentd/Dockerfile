FROM fluent/fluentd:latest
ARG license
ENV NEW_RELIC_LICENSE_KEY ${license}
ENV FLUENTD_CONF fluentd-newrelic.conf
RUN fluent-gem install fluent-plugin-newrelic
COPY ./services/fluentd/fluentd-newrelic.conf /
RUN sed -i "s/NEW_RELIC_LICENSE_KEY/${NEW_RELIC_LICENSE_KEY}/g" /fluentd-newrelic.conf
RUN cat /fluentd-newrelic.conf && cat /fluentd-newrelic.conf >> /fluentd/etc/fluentd-newrelic.conf