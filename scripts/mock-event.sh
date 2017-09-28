#!/usr/bin/env bash

set -euo pipefail

RED='\033[0;31m'
ORANGE='\033[0;33m'
NC='\033[0m'

if ! type lambda-local > /dev/null; then
    echo -e "${RED}[Error]${NC} missing lambda-local. Run ${ORANGE}npm install${NC}.\n"
    exit 1
fi

if [ "$2" == "--valid-location" ]; then
    LOC="valid"
elif [ "$2" == "--invalid-location" ]; then
    LOC="invalid"
else
    echo -e "${RED}[Error]${NC} pass ${ORANGE}--[in]valid-location${NC}.\n"
    exit 2
fi

lambda-local -l index.js -h handler -t 12 -e "mock-events/$1.json" -E "{\"MOCK_LOCATION\": \"$LOC\"}"
