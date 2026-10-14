#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=========================================================="
echo " Starting MyBillBook Billing & Accounting System..."
echo " 100% Free Lifetime - No Renewal Required"
echo "=========================================================="

# Check if node is installed
if ! command -v node &> /dev/null
then
    echo "Node.js is not found. Please ensure Node.js is installed."
    exit 1
fi

# Open browser after a brief delay
(sleep 1.5 && open "http://localhost:5000") &

# Start Express server (serves both API and Web UI)
node server/index.js
