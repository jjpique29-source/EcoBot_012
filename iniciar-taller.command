#!/bin/bash
cd "$(dirname "$0")"
command -v node >/dev/null || { echo "Falta instalar Node.js: https://nodejs.org"; read; exit 1; }
(sleep 1; open "http://localhost:8080/admin.html") &
node servidor.js
