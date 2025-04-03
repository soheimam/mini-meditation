#!/bin/bash

# Make POST request to complete meditation
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-Farcaster-FID: " \
  http://localhost:3000/api/meditation/complete 