#!/usr/bin/env bash

node --max-old-space-size=2048 "$CODE/js/springstrap/dist/springstrap.js" "$@"
