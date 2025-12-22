'gcloudprojectslist'
gcloudprojectlist
man
uname -a
ls
df -h
# ComplianceDesk Factory Script - Run Once
gcloud config set project antigravitycompliancedeskai
gcloud config set run/region asia-south1
# Enable the Brains
gcloud services enable run.googleapis.com     cloudbuild.googleapis.com     sqladmin.googleapis.com     secretmanager.googleapis.com     aiplatform.googleapis.com     vision.googleapis.com     artifactregistry.googleapis.com
# Create the Docker Warehouse
gcloud artifacts repositories create compliancedesk-repo     --repository-format=docker     --location=asia-south1     --description="Docker repository for ComplianceDesk"
echo "✅ Infrastructure Factory Complete. Ready for Code."
gcloud auth application-default login
4/0ATX87lMd1CTv2tx4Ds8qHrGdJl79OxShN_0Xnz_IKGBFXUx3B4YiGbzN-QyFPdcyVsdKLw
1. Set variables
export PROJECT_ID="antigravitycompliancedeskai"
export SA_NAME="antigravity-deployer"
export SA_EMAIL="$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"
# 2. Create the Service Account
gcloud iam service-accounts create $SA_NAME     --description="Service account for Antigravity deployment"     --display-name="Antigravity Deployer"     --project=$PROJECT_ID
# 3. Grant Permissions
# Firebase Hosting
gcloud projects add-iam-policy-binding $PROJECT_ID     --member="serviceAccount:$SA_EMAIL"     --role="roles/firebasehosting.admin"
# Cloud Build
gcloud projects add-iam-policy-binding $PROJECT_ID     --member="serviceAccount:$SA_EMAIL"     --role="roles/cloudbuild.builds.editor"
# Service Account User (Required for the agent to act as this account)
gcloud projects add-iam-policy-binding $PROJECT_ID     --member="serviceAccount:$SA_EMAIL"     --role="roles/iam.serviceAccountUser"
# Viewer (So the agent can see the project status)
gcloud projects add-iam-policy-binding $PROJECT_ID     --member="serviceAccount:$SA_EMAIL"     --role="roles/viewer"
# Storage Admin (For staging buckets)
gcloud projects add-iam-policy-binding $PROJECT_ID     --member="serviceAccount:$SA_EMAIL"     --role="roles/storage.admin"
# 4. Generate the Key File
gcloud iam service-accounts keys create workspace-key.json     --iam-account=$SA_EMAIL     --project=$PROJECT_ID
gcloud resource-manager org-policies disable-enforce     constraints/iam.disableServiceAccountKeyCreation     --project=antigravitycompliancedeskai
gcloud iam service-accounts keys create workspace-key.json     --iam-account=antigravity-deployer@antigravitycompliancedeskai.iam.gserviceaccount.com     --project=antigravitycompliancedeskai
gcloud iam service-accounts keys create workspace-key.json     --iam-account=antigravity-deployer@antigravitycompliancedeskai.iam.gserviceaccount.com     --project=antigravitycompliancedeskai
