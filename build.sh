#!/usr/bin/env bash
set -o errexit

# Install frontend dependencies and build (includes prerendering static HTML — see
# UI/scripts/prerender-static.mjs)
cd UI
npm install
npm run build
cd ..

# Install backend dependencies
pip install -r backend/requirements.txt
