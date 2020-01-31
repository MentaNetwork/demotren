#!/bin/sh
echo "STARTING TCP (:9000) SERVER..."
python /app/tcpserver.py 0.0.0.0 9000 &
P1=$!
wait $P1
echo "DONE"