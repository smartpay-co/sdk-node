#!/bin/bash

FILES=src/schemas/*.json

for f in $FILES; do
  echo $f
  OUT=src/schemas/$(basename -s .json $f).ts
  printf '%s %s\n' "export default " "$(cat $f)" > $OUT
  npx prettier --write $OUT
done

echo "done"
