#!/bin/bash

# this script is intended to run in the root folder of the repo

# the following list needs to match the RELEASE_ASSETS env var in
# .github/workflows/release.yml except for SHA512CHECKSUMS.txt
files="dist/*.exe
dist/*.blockmap
dist/*.zip
dist/*.AppImage
dist/*.deb
dist/*.tar.gz
dist/latest.yml
dist/latest-linux.yml"

for file in $files
do
    if [ -f "$file" ]; then
        checksum=$(openssl sha512 -binary $file | openssl base64 -A)
        echo $checksum "*"$(basename $file) >> dist/SHA512CHECKSUMS.txt
    fi
done
