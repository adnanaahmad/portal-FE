#!/bin/bash

cd /var/www/app

curl -s -O -J -L "https://i.dev.fortifid.com/data/od7kTXfGxDax/portal-front-out-prod.tar.gz"

if [ -d ./out.old ]; then
    rm -rf ./out.old
fi

if [ -d ./out ]; then
    mv ./out ./out.old 
fi

tar -zxf "portal-front-out-prod.tar.gz"

