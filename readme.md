cd build 

npm install

npm install -g gulp

npm run build-watch


Первоначально необходимо:
* Создать в /opt/z-way-server/automation/modules каталог MyHomeAutomation
* Скопировать в него содержимое каталога dist/release

Можно таким способом:
* git clone https://github.com/alexxandreas/home-automation.git /tmp/home-automation
* bash /tmp/home-automation/dist/release/update.bash 

Для последующего обновления достаточно вызывать bash MyHomeAutomation/update.bash




Модуль предоставляет обертку, в которой запускается собранный js
