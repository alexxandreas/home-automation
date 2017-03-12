#!/bin/bash

tmpDir=/tmp/home-automation
destDir=/opt/z-way-server/automation/modules/MyHomeAutomation
gitRepo=https://github.com/alexxandreas/home-automation.git

if [ ! -d $tmpDir ]; then
    # Control will enter here if $DIRECTORY doesn't exist.
    echo "Temp directory doesn't exist"
    git clone $gitRepo $tmpDir
else
    
fi

rm -rf $tmpDir
git clone $gitRepo $tmpDir
cp -rf $tmpDir/dist/release/* $destDir

rm -f $destDir/update.bash.bak
mv $destDir/update.bash $destDir/update.bash.bak
cp -f $tmpDir/dist/release/update.bash $destDir/update.bash

rm -rf $tmpDir

