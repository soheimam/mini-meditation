#!/bin/bash

echo "Testing Meditation Reminder API for FID 20390"
echo "-------------------------------------------"

# Base URL - adjust this if needed
BASE_URL="http://localhost:3000"

echo "1. Getting current reminder preference (GET request)"
curl -X GET \
  -H "X-Farcaster-FID: 20390" \
  "${BASE_URL}/api/meditation/reminder"

echo -e "\n\n2. Setting reminder preference without token (POST request)"
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-Farcaster-FID: 20390" \
  -d '{"enabled": true}' \
  "${BASE_URL}/api/meditation/reminder"

echo -e "\n\n3. Setting reminder preference with token and URL (POST request)"
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-Farcaster-FID: 20390" \
  -d '{"enabled": true, "token": "test_token_123", "url": "https://test-url.com/notify"}' \
  "${BASE_URL}/api/meditation/reminder"

echo -e "\n\n4. Getting reminder preference after update (GET request)"
curl -X GET \
  -H "X-Farcaster-FID: 20390" \
  "${BASE_URL}/api/meditation/reminder"

echo -e "\n\n5. Disabling reminder preference (POST request)"
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-Farcaster-FID: 20390" \
  -d '{"enabled": false}' \
  "${BASE_URL}/api/meditation/reminder"

echo -e "\n\n6. Getting reminder preference after disabling (GET request)"
curl -X GET \
  -H "X-Farcaster-FID: 20390" \
  "${BASE_URL}/api/meditation/reminder"

echo -e "\n" 