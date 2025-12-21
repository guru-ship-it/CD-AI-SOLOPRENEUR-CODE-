# Mission: Production Data Layer
**Role:** Database Administrator

## 1. Cloud SQL Enterprise Plus
* **Config:**
    * Version: PostgreSQL 15.
    * Availability: **High Availability (Regional)**. (If Zone A fails, Zone B takes over in <60s).
    * Backups: Automated Daily + Point-in-Time Recovery (PITR) enabled.
    * **Private IP Only:** No public internet access.

## 2. Migration Script (`migrate_prod.py`)
* If you have any demo data worth keeping:
    * Script to dump `demo_db` -> Sanitize PII -> Restore to `prod_db`.
    * *Recommendation:* Start fresh for Production to ensure clean audit trails.
