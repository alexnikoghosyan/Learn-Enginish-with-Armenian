@echo off
cd /d "%~dp0"
echo === git === > publish-log.txt
git add -A >> publish-log.txt 2>&1
git commit -F commit-message.txt >> publish-log.txt 2>&1
git push origin HEAD >> publish-log.txt 2>&1
echo === deploy === >> publish-log.txt
node worker\pages-build.mjs >> publish-log.txt 2>&1
call npx --yes wrangler@latest pages deploy deploy --project-name armduo --branch main --commit-dirty=true >> publish-log.txt 2>&1
echo === done === >> publish-log.txt
