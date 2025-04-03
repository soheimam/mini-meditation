#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Load environment variables from .env file if it exists
if [ -f .env ]; then
  echo -e "${YELLOW}Loading environment variables from .env file...${NC}"
  export $(grep -v '^#' .env | xargs)
fi

# Check if CRON_SECRET is set
if [ -z "$CRON_SECRET" ]; then
  echo -e "${RED}Error: CRON_SECRET environment variable is not set.${NC}"
  echo -e "Please set it in your .env file or export it directly."
  exit 1
fi

# Define the API endpoint URL
API_URL="http://localhost:3000/api/cron/daily-reminder"

echo -e "${GREEN}Testing cron job endpoint: ${API_URL}${NC}"
echo -e "${YELLOW}Using CRON_SECRET from environment variables${NC}"

# Make the request with the proper authorization header
response=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer $CRON_SECRET" \
  "$API_URL")

# Extract the HTTP status code and response body
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

# Print results
echo -e "${YELLOW}HTTP Status Code: ${http_code}${NC}"

if [ "$http_code" -eq 200 ]; then
  echo -e "${GREEN}Success! Response:${NC}"
  echo "$body" | json_pp || echo "$body"
else
  echo -e "${RED}Error! Response:${NC}"
  echo "$body"
fi 