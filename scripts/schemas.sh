#!/bin/bash

FILES=src/schemas/*.json

for f in $FILES; do
  printf '%s %s\n' "export default " "$(cat $f)" > src/schemas/$(basename -s .json $f).ts
  npx prettier --write src/schemas/$(basename -s .json $f).ts
done
