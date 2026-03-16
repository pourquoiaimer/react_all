#!/bin/bash
git add .
git commit -m "Update and build project"
git push origin main
npm run build
npm run deploy
