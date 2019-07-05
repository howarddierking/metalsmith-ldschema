# repository: howarddierking/metalsmith-ldschema-host
FROM alpine:3.9
LABEL maintainer="howarddierking@gmail.com"
LABEL reference="https://github.com/nodejs/docker-node/blob/5a6a5e91999358c5b04fddd6c22a9a4eb0bf3fbf/10/alpine/Dockerfile, https://hub.docker.com/r/mesosphere/aws-cli/dockerfile"

# NODE SETUP
RUN apk add --update nodejs=10.14.2-r0 npm=10.14.2-r0 yarn

# AWS CLI SETUP
RUN apk -v --update add \
        python \
        py-pip \
        groff \
        less \
        mailcap \
        && \
    pip install --upgrade awscli==1.14.5 s3cmd==2.0.1 python-magic && \
    apk -v --purge del py-pip && \
    rm /var/cache/apk/*

COPY entrypoint /usr/local/bin
RUN chmod +x /usr/local/bin/entrypoint

VOLUME /project
WORKDIR /project
EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/entrypoint"]
