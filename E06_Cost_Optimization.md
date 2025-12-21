# Mission: Solopreneur Cost Optimization
**Role:** FinOps

## 1. Scale-to-Zero Policies
* **Worker Service:** Min instances = 0. (Don't pay when no one is uploading docs).
* **API Service:** Min instances = 1 (Keep 1 warm for fast response, costs ~$30/mo).

## 2. Lifecycle Policies
* **Buckets:**
    * `temp-processing`: Delete after 10 mins.
    * `logs`: Archive to "Coldline" storage after 30 days (Cheaper).

## 3. Budget Alerts
* Set a **GCP Budget Alert** at ₹5,000/month.
* If cost > 80%, send an SMS to your phone immediately.
