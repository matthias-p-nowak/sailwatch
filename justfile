
app:
    tsc -w -p tsconfig.app.json

sw:
    tsc -w -p tsconfig.sw.json

css:
    sass -w scss/main.scss webapp/app.css