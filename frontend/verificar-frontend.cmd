@echo off
setlocal
set "NODE_HOME=%~dp0..\.tools\node-v22.14.0-win-x64"
set "PATH=%NODE_HOME%;%PATH%"
call "%NODE_HOME%\npm.cmd" run build
