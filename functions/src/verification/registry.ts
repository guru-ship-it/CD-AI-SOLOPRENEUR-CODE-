import { PanAdapter } from "./adapters/pan-adapter";
import { DLAdapter } from "./adapters/dl-adapter";
import { DigiLockerAdapter } from "./adapters/digilocker-adapter";

export const ADAPTER_REGISTRY: Record<string, any> = {
    "PAN": new PanAdapter(),
    "DRIVING_LICENSE": new DLAdapter(),
    "DIGILOCKER": new DigiLockerAdapter(),
    // Add VOTER, GST, PASSPORT here easily
};
