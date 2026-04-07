@echo off

start "DEV" powershell -NoExit -Command "npm run dev"

start "SERVER" powershell -NoExit -Command "npm run server"