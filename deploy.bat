@echo off
cd /d "%~dp0"
echo === node === > deploy-log.txt
where node >> deploy-log.txt 2>&1
node -v >> deploy-log.txt 2>&1
echo === build === >> deploy-log.txt
node worker\pages-build.mjs >> deploy-log.txt 2>&1
echo === login === >> deploy-log.txt
call npx --yes wrangler@latest whoami >> deploy-log.txt 2>&1
findstr /C:"You are logged in" deploy-log.txt >nul || call npx --yes wrangler@latest login
echo === deploy === >> deploy-log.txt
call npx --yes wrangler@latest pages deploy deploy --project-name armduo --branch main --commit-dirty=true >> deploy-log.txt 2>&1
echo === done === >> deploy-log.txt
timeout /t 5
