#!/bin/sh

if [ "$0" = "/bin/sh" ] ; then cd "${1%/*}" ; else cd "${0%/*}" ; fi

TOOLS=/Volumes/Active/Process/tools
if [ \! -e "$TOOLS" ]
then
  echo "$TOOLS not found. Please mount X1 to build."
  exit 1
fi

echo "Generating Manifest"
"$TOOLS/manifest.sh"

