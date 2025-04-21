all:

firefox-devel:
    firefox -P devel  https://127.0.0.1:5500/ --start-debugger-server &

version:
    sed -i -e "s/currentGitVersion/$(git rev-parse --short HEAD)/" app/main.js app/service-main.js

clean:
    rm -fr app/*{js,js.map,css,css.map}