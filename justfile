#justfile
all:

firefox-devel: 
    firefox -P devel  https://127.0.0.1:5500/ --start-debugger-server

bypass: 
    echo bypass > app/version

now-version:
    date +%k:%M:%S > app/version

version: 
    git rev-parse --short HEAD >app/version
css: 
    sass -w scss/main.scss app/main.css

js: 
    esbuild --bundle src/main.ts src/background.ts --outdir=app --sourcemap --watch

clean: 
    rm -fr app/*{js,js.map,css,css.map}
