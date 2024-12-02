#!/bin/bash

SCRIPT_DIR="./eng/scripts/ValidateYaml"
if [ -f $SCRIPT_DIR/validateYaml.js ]; then
  echo "Running validateYaml.js..."
  cd $SCRIPT_DIR
  node validateYaml.js 
else
  echo "validateYaml.js not found in $SCRIPT_DIR. Exiting."
  exit 1
fi