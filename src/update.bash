rm -rf /tmp/home-automation
git clone https://github.com/alexxandreas/home-automation.git /tmp/home-automation
cp -rf /tmp/home-automation/dist/release/* /opt/z-way-server/automation/modules/MyHomeAutomation
rm -rf /tmp/home-automation