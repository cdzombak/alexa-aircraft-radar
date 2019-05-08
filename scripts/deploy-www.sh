#!/usr/bin/env bash

set -euo pipefail

rsync -vr --delete ./www/ cdzombak@radarskill:~/www/radarskill.dzombak.com/
