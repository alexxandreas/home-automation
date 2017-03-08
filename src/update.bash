#!/bin/bash

tmpDir=/tmp/home-automation
destDir=/opt/z-way-server/automation/modules/MyHomeAutomation
gitRepo=https://github.com/alexxandreas/home-automation.git


rm -rf $tmpDir
git clone $gitRepo $tmpDir
cp -rf $tmpDir/dist/release/* $destDir

rm -f $destDir/update.bash.bak
mv $destDir/update.bash $destDir/update.bash.bak
cp -f $tmpDir/dist/release/update.bash $destDir/update.bash

rm -rf $tmpDir

echo echo-2