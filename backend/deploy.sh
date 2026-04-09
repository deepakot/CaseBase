#!/bin/bash

# 1. Ensure you are logged into the correct Google account
echo "Checking Google Cloud authentication..."
# gcloud auth login (Skipping since you are already logged in)

# 2. Set the project to careerlift-94911
echo "Setting project to careerlift-94911..."
gcloud config set project careerlift-94911

# 3. Enable required APIs
echo "Enabling Cloud Run and Cloud Build APIs..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# 4. Generate the .env.yaml file from your local .env
echo "Generating environment variables for Cloud Run..."
node generate_yaml.js

# 5. Deploy to Cloud Run
echo "Deploying backend to Google Cloud Run..."
gcloud run deploy legal-casebase-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --env-vars-file .env.yaml

echo "Deployment complete! Copy the Service URL provided above and update your frontend/.env file."
