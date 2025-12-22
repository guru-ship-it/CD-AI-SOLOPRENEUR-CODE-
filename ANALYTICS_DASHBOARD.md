# Module: Visual Intelligence (Bento Grid)

## 1. Requirement
A high-performance dashboard using `Recharts` and `React-Grid-Layout`.

## 2. Key Widgets
1.  **The "Live Feed":** Real-time scrolling log of verifications (Anonymized).
2.  **The "Fraud Map":** India Map highlighting districts with high `REJECTED` rates.
3.  **The "TAT Monitor":** Average Turn-Around-Time for verifications (SLA Tracking).

## 3. Aggregation Logic (`functions/src/analytics.ts`)
Do not query the whole DB. Use a Scheduled Function (Cron Job) to aggregate stats every hour.

```typescript
export const aggregateHourlyStats = onSchedule("every 1 hours", async (event) => {
  // Count Pass/Fail in last hour
  // Update 'daily_stats' collection
  // This makes the Dashboard load instantly
});
```
