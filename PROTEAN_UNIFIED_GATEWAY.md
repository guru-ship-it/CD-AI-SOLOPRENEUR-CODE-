# Protean Unified Identity Gateway

**Objective:** A single, scalable Cloud Function to handle 25+ Identity Verification types (PAN, DL, Voter, GST, etc.) using the "Adapter Pattern."

## 1. Architecture Overview
Instead of exposing 25 different API endpoints, we expose **ONE** master endpoint: `verifyDocument`.

* **Input:** `{ type: "PAN", inputs: { idNumber: "ABC...", dob: "..." } }`
* **Logic:** The Gateway looks up the "PAN Adapter," authenticates with Protean using Secret Manager, executes the call via Axios, and normalizes the response into a standard format.
* **Output:** `{ isValid: true, legalName: "GURU PRASAD", rawResponse: { ... } }`

## 2. Directory Structure (`functions/src/verification/`)
```text
/verification
├── gateway.ts          # The Master Cloud Function (v2 Entry Point)
├── registry.ts         # The Configuration Map (Type -> Adapter)
├── interface.ts        # The Rules every Adapter must follow (StandardResult)
└── adapters/           # The Logic Plugins
    ├── pan-adapter.ts
    ├── dl-adapter.ts
    └── digilocker-adapter.ts
```

## 3. Implementation Details

### Core Gateway
The `verifyDocument` function (Firebase v2) handles:
- **Secret Injection**: Securely retrieving `PROTEAN_API_KEY` and `PROTEAN_BEARER_TOKEN`.
- **API Execution**: Centralized `axios` logic with header management.
- **Audit Logging**: Ensuring every response includes `rawResponse` for mandatory tracing.

### Adapters
Each adapter (e.g., `PanAdapter`) is an isolated module that:
1. Defines its own Protean `endpoint`.
2. Implements `buildRequest(inputs)` to match Protean's data requirements.
3. Implements `normalizeResponse(res)` to map messy API data to our clean `StandardResult`.

## 4. Maintenance
If a Protean URL changes (e.g., Driving License):
1. Open `dl-adapter.ts`.
2. Update the `endpoint` variable.
3. Deploy.
No changes are required in the Frontend or the Gateway core.
