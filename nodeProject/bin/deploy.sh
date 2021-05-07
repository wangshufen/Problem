#!/bin/sh
cd `dirname $0`
BIN_DIR=`pwd`
cd ../server
mv mysql_config.js mysql_config.js_bak
mv mysql_config_prod.js mysql_config.js

mv setDomain.js setDomain.js_bak
mv setDomain_prod.js setDomain.js
echo deploy Success!