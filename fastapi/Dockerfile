# syntax = docker/dockerfile:1.4

FROM tiangolo/uvicorn-gunicorn-fastapi:python3.9-slim AS builder

# Install Java and set JAVA_HOME
RUN apt-get update && apt-get install -y openjdk-17-jdk
ENV JAVA_HOME /usr/lib/jvm/java-17-openjdk-amd64

# Install Hadoop client
ENV HADOOP_VERSION 3.3.4
RUN wget https://downloads.apache.org/hadoop/common/hadoop-${HADOOP_VERSION}/hadoop-${HADOOP_VERSION}.tar.gz \
    && tar -xzf hadoop-${HADOOP_VERSION}.tar.gz -C /opt/ \
    && rm hadoop-${HADOOP_VERSION}.tar.gz
ENV HADOOP_HOME /opt/hadoop-${HADOOP_VERSION}
ENV PATH $PATH:$HADOOP_HOME/bin

WORKDIR /app

COPY requirements.txt ./
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt
RUN pip install cryptography

COPY ./app ./app

FROM builder as dev-envs

RUN <<EOF
apt-get update
apt-get install -y --no-install-recommends git
EOF

RUN <<EOF
useradd -s /bin/bash -m vscode
groupadd docker
usermod -aG docker vscode
EOF
  
# install Docker tools (cli, buildx, compose)
COPY --from=gloursdocker/docker / /