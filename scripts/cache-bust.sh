#!/bin/bash
# Simple cache busting script for deployment

# Get current timestamp
TIMESTAMP=$(date +%s)

echo "Adding cache-busting parameters to assets..."

# Update CSS and JS references with timestamps
sed -i.bak "s/styles\.css/styles.css?v=$TIMESTAMP/g" *.html
sed -i.bak "s/hero\.js/hero.js?v=$TIMESTAMP/g" *.html
sed -i.bak "s/footer-datetime\.js/footer-datetime.js?v=$TIMESTAMP/g" *.html

echo "Cache busting applied with timestamp: $TIMESTAMP"
echo "Backup files created with .bak extension"