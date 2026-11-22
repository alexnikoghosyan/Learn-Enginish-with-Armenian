@echo off
cd /d "%~dp0"
echo === login === > login-log.txt
call npx --yes wrangler@latest login --browser=false >> login-log.txt 2>&1
echo === deploy === >> login-log.txt
call npx --yes wrangler@latest pages deploy deploy --project-name armduo --branch main --commit-dirty=true >> login-log.txt 2>&1
echo === done === >> login-log.txt
