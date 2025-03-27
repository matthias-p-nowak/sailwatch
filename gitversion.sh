#!/bin/bash
sed -i -e "s/currentGitVersion/$(git rev-parse --short HEAD)/" app/js/app.js app/js/sw.js
