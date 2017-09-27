#!/usr/bin/env bash

set -euo pipefail

RED='\033[0;31m'
ORANGE='\033[0;33m'
NC='\033[0m'

if [[ ! -d node_modules ]]; then
    echo -e "${RED}[Error]${NC} missing node_modules. Run ${ORANGE}npm install --production${NC}.\n"
    exit 1
fi

mkdir -p products
zip -rq products/aircraft-radar.zip *.js node_modules
