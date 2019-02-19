FROM microsoft/dotnet:2.1-sdk

# New Relic
RUN echo 'deb http://apt.newrelic.com/debian/ newrelic non-free' | tee /etc/apt/sources.list.d/newrelic.list && \
    wget -O- https://download.newrelic.com/548C16BF.gpg | apt-key add - && \
    apt-get update && \
    apt-get install newrelic-netcore20-agent
ENV CORECLR_ENABLE_PROFILING=1 \
    CORECLR_PROFILER={36032161-FFC0-4B61-B559-F6C5D41BAE5A} \
    CORECLR_NEWRELIC_HOME=/usr/local/newrelic-netcore20-agent \
    CORECLR_PROFILER_PATH=/usr/local/newrelic-netcore20-agent/libNewRelicProfiler.so \
    NEW_RELIC_APP_NAME=Core \
    NEW_RELIC_DISTRIBUTED_TRACING_ENABLED=true

WORKDIR /app

ENV ASPNETCORE_URLS http://+:5000
EXPOSE 5000

COPY source ./
RUN dotnet publish -c Release -o out

ENTRYPOINT ["dotnet", "out/core.dll"]