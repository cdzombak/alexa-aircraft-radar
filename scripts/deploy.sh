#!/usr/bin/env bash

AWS_PROFILE_NAME=${AWS_PROFILE_NAME:-default}

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
ORANGE='\033[0;33m'
NC='\033[0m'

if [[ ! -f products/aircraft-radar.zip ]]; then
    echo -e "${RED}[Error]${NC} build product missing. Run ${ORANGE}npm run package${NC}.\n"
    exit 1
fi

if ! type aws > /dev/null; then
    echo -e "${RED}[Error]${NC} missing AWS cli eool. On macOS, install via ${ORANGE}brew install awscli${NC}.\n"
    exit 1
fi

aws lambda update-function-code \
    --region us-east-1 \
    --profile "$AWS_PROFILE_NAME" \
    --function-name AircraftRadarSkill \
    --zip-file fileb://products/aircraft-radar.zip \
    --output table --no-paginate

echo ""

aws lambda update-function-code \
    --region eu-west-1 \
    --profile "$AWS_PROFILE_NAME" \
    --function-name AircraftRadarSkill_EUWest \
    --zip-file fileb://products/aircraft-radar.zip \
    --output table --no-paginate

echo ""
