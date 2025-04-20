all:

firefox-devel:
    firefox -P devel  https://127.0.0.1:5500/ --start-debugger-server &

version:
    sed -i -e "s/currentGitVersion/$(git rev-parse --short HEAD)/" app/js/main.js app/js/service-worker.js
