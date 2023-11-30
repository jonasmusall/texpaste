#!/bin/bash

# this script is intended to run in the root folder of the repo

if ! [ -d "dist" ]; then
    exit
fi
rm -rf dist/deb-unpacked
mkdir -p dist/deb-unpacked

# md5 digest is 32 bytes but openssl appends a newline char
md5sum=$(openssl md5 build/icons/scalable.svg | tail -c 33)

debfiles="dist/*.deb"
for file in $debfiles
do
    if [ -f "$file" ]; then
        filebn=$(basename $file)
        dpkg-deb -R $file dist/deb-unpacked/$filebn
        mkdir -p dist/deb-unpacked/$filebn/usr/share/icons/hicolor/scalable/apps
        cp build/icons/scalable.svg dist/deb-unpacked/$filebn/usr/share/icons/hicolor/scalable/apps/texpaste.svg
        echo "$md5sum  usr/share/icons/hicolor/scalable/apps/texpaste.svg" >> dist/deb-unpacked/$filebn/DEBIAN/md5sums
        dpkg-deb -b dist/deb-unpacked/$filebn $file
    fi
done
