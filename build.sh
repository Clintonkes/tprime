#!/usr/bin/env bash
set -o errexit

# Install frontend dependencies and build
npm install
npm run build

# Install backend dependencies
pip install -r backend/requirements.txt
