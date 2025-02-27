#!/bin/sh
. /venv/bin/activate
python3 /seismo.py
while true;do
 echo "keep alive";
 sleep 600;
done

