FROM alpine:latest
RUN apk add --no-cache python3 py3-pip

RUN python3 -m venv /venv
RUN . /venv/bin/activate; pip install websockets

ADD ./seismo.py /seismo.py
ADD ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
CMD ["/entrypoint.sh"]

