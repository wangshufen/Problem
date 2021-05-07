#!/bin/sh
cd `dirname $0`
BIN_DIR=`pwd`
cd ../../logs
LOG_DIR=`pwd`
cd $BIN_DIR
cd ../
rm -f tpid

nohup node app.js nodeProjectServer >> $LOG_DIR/nodeProject.log  2>&1 &

echo $! > tpid

echo Start Success!