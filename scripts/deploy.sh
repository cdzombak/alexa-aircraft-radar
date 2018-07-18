#!/usr/bin/env bash

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
ORANGE='\033[0;33m'
NC='\033[0m'

if [[ ! -f products/aircraft-radar.zip ]]; then
    echo -e "${RED}[Error]${NC} build product missing. Run ${ORANGE}npm run package${NC}.\n"
    exit 1
fi

realpath() {
    [[ $1 = /* ]] && echo "$1" || echo "$PWD/${1#./}"
}

realpath products/aircraft-radar.zip | pbcopy
echo -e "${GREEN}Copied product path to the clipboard.${NC}"
echo -e "${ORANGE}ℹ️  Remember to deploy in all applicable AWS regions.${NC}\n"
open "https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions/AircraftRadarSkill?tab=code"
open "https://eu-west-1.console.aws.amazon.com/lambda/home?region=eu-west-1#/functions/AircraftRadarSkill_EUWest?tab=code"
