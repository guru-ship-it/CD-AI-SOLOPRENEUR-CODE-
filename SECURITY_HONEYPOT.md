# Security Feature: The "Honeypot" Trap

## 1. Objective
Identify and ban malicious actors scanning for common administrative vulnerabilities (e.g., trying to access `/admin`, `/wp-login.php`, or `/config`).

## 2. The Trap Endpoint
* **Route:** Create a hidden route `/admin-super-login` or similar that *looks* enticing but is not linked anywhere in the real app.
* **Mechanism:** If any IP address attempts to access this route:
    1.  **Log:** Immediately log the IP address, User Agent, and Timestamp to a `blocked_ips` Firestore collection.
    2.  **Ban:** Create a Firestore Rule that permanently denies read/write access to any IP found in the `blocked_ips` collection.
    3.  **Alert:** Trigger a high-priority alert to the Master Admin dashboard.

## 3. Implementation Logic
```typescript
// Edge Function / Middleware logic
if (request.url.includes('/admin-super-login')) {
  await firestore.collection('blocked_ips').doc(request.ip).set({
    reason: 'Honeypot Triggered',
    timestamp: new Date()
  });
  return response.status(403).send('Access Denied');
}
```
