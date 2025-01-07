#!/bin/bash

# Clean previous builds
rm -rf .next out

# Build the app
npm run build

# Create .nojekyll file
touch out/.nojekyll

# Add and commit changes
git add .
git commit -m "Deploy to GitHub Pages"

# Push to gh-pages branch
git push origin gh-pages --force
