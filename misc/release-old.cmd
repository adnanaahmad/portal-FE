@echo off
echo Production build started...
copy misc\.env.production .\.env.production /y

cmd /C npm run build-export
echo Creating archive...
tar -czf portal-front-out-prod.tar.gz ./out

echo Production build created.

echo Sandbox build started...
copy misc\.env.development .\.env.production /y

cmd /C npm run build-export
echo Creating archive...
tar -czf portal-front-out-sandbox.tar.gz ./out
echo Sandbox build created.
echo .

cd C:\dev\projects\fortifid
move customerportalmvp-stage\*.gz .

echo Creating full backup...
tar -czf portal-front.tar.gz --exclude=./node_modules  --exclude=./out --exclude=./.next --exclude=*.gz ./customerportalmvp-stage
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

cd customerportalmvp-stage

echo Done.
