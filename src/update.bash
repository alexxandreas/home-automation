#!/bin/bash

tmpDir=/tmp/home-automation
destDir=/opt/z-way-server/automation/modules/MyHomeAutomation
gitRepo=https://github.com/alexxandreas/home-automation.git

if [ ! -d $tmpDir ]; then
    echo "Temp directory doesn't exist. Start git clone"
    git clone $gitRepo $tmpDir
else
    echo "Temp directory exist. Start git pull"
    git -C $tmpDir pull
fi

#rm -rf $tmpDir
#git clone $gitRepo $tmpDir

cp -rf $tmpDir/dist/release/* $destDir

rm -f $destDir/update.bash.bak
mv $destDir/update.bash $destDir/update.bash.bak
cp -f $tmpDir/dist/release/update.bash $destDir/update.bash

#rm -rf $tmpDir 

