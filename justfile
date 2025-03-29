
all: css js version

js:
    esbuild --bundle src/app.ts src/sw.ts --outdir=app/js --minify

version:
    sed -i -e "s/currentGitVersion/$(git rev-parse --short HEAD)/" app/js/app.js app/js/sw.js

css:
    sass scss/main.scss app/css/app.css