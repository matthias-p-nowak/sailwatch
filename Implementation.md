# Overview

The application is composed of some assets like the index.html, compiled scss and compiled and bundled typescript.

## General approach

The `index.html` file is the starting point and refers to the script file `main.js` and the style file `main.css`. Those two are compiled from several typescript files and several scss files. 

The transpiling and bundling of the typescript files is done by *esbuild*. **Note**, do not enable `--minify` since that removes or renames some required functions. This approach allows low level javascript programming with the additional benefits of types. 

### Bundling instead of modules

When installed as an application, all files should be cached. Bundling all javascript files into one easens the burden. Moreover, all parts are expected to be used. Typescript has advantages while programming, including intellisense and type checking. Full package mode seems to be overkill for this project.

The transpiler/bundler *esbuild* takes the `main.ts` as an entry and imports all the other referred typescript files. 

# Assets

Location | Purpose
--- | --- 
`app/index.html` | the only html file, start point and reference to all resources
`app/sailwatch.ico` | the icon to display
`app/img/*.png` | different symbols and flags
`app/snd/*.wav` | sound files to play for start and finish

# SCSS

The `scss/main.scss` is compiled to `app/main.css`. As a hierarchical format, it contains the style definitions in a compact format.

# Typescript files

The same javascript file `main.js` is used both for the document script (aka main thread) and for the service worker.

File | Purpose / content
--- | ---
`main.ts` | entry point and detects environment
`component.ts` | WebComponent class - attaches the object to the html document
`datefmt.ts` | time formatting function
`sailwatch.ts` | main data structure for the app
`sailwatchdb.ts` | layer for the IndexedDb storage
 other files | ignored by esbuild
`window.d.ts` | the definition of the Window object extension
`tsconfig.json` | defines the typescript - only considered by VS code


## main.ts

The main thread has access to the document, while the service worker has access to the ServiceWorkerGlobalScope - both offer different properties or method. Their presence indicates which environment this script runs in. **Note**, different browsers are slightly different, hence detection needs to work across browsers.

## sailwatch.ts

## sailwatchdb.ts

## datefmt.ts

## component.ts

*WebComponent* is a abstract base class in javascript for related elements in the HTML DOM. In difference to React, all html parts are defined inside templates or are part of the html document. Hence, the javascript code with very few exceptions does not create elements using `document.createElement('<tagname>')`. Instead, html parts are cloned from templates or existing parts are connected to javascript.

### WebComponent.fillElement

This function attaches class properties to the DOM elements and also attaches event handlers. 
Properties that have the value 'undefined' are considered. 
Since javascript reflection does not provide type information, any attempts to check for *HTMLElement* will fail.
The only way is "brute force", which will not have such a big impact, since the search is on a subtree.
The *fillElement* method prepends 'js_' to the name of the name of the property and tries to find a DOM element with that class. If so, the DOM element is assigned to that javascript property. 

All class methods are considered as potential event handlers. 
When they contain '_on', the *fillElement* function will try to assign this method as an eventhandler to that property. 
The property with the heading part must exist and be assigned to a DOM element.

## serviceworker.ts

Intention of the service worker is to keep the web page in focus when a start procedure is ongoing or about to commence.