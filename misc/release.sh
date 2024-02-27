#!/bin/bash

cd "${0%/*}"

CURRENT="$(pwd)"

echo $CURRENT

exit 0;

echo Production build started...

cp ./misc/.env.production ./.env.production

# May want to look at the errror though
npm run build-export || true

echo Creating archive...
tar -czf portal-front-out-prod.tar.gz ./out

echo Production build created.

echo Sandbox build started...
cp  ./misc/.env.development ./.env.production

npm run build-export || true
echo Creating archive...
tar -czf portal-front-out-sandbox.tar.gz ./out
echo Sandbox build created.
echo .

cd ../
mv "$CURRENT"/*.gz .

echo Creating full backup...
tar -czf portal-front.tar.gz --exclude=./node_modules  --exclude=./out --exclude=./.next --exclude=*.gz "$CURRENT"
echo Backup created.

echo Uploading portal-front-out-prod.tar.gz...
curl -F upload=@portal-front-out-prod.tar.gz https://i.dev.fortifid.com/u/
echo .

echo Uploading portal-front-out-sandbox.tar.gz...
curl -F upload=@portal-front-out-sandbox.tar.gz https://i.dev.fortifid.com/u/
echo .

echo Uploading portal-front.tar.gz...
curl -F upload=@portal-front.tar.gz https://i.dev.fortifid.com/u/
echo .

cd "$CURRENT"

echo Done.
