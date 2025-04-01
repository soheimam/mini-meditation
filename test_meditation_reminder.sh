#!/bin/bash

echo "Testing Meditation Reminder API for FID 20390"
echo "-------------------------------------------"

# Base URL - adjust this if needed
BASE_URL="http://localhost:3000"

echo "1. Setting reminder preference (POST request)"
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-Farcaster-FID: 20390" \
  -d '{"enabled": true}' \
  "${BASE_URL}/api/meditation/reminder"

echo -e "\n\n2. Getting reminder preference (GET request)"
curl -X GET \
  -H "X-Farcaster-FID: 20390" \
  "${BASE_URL}/api/meditation/reminder"

echo -e "\n" 