import { PanAdapter } from "./adapters/pan-adapter";
import { DLAdapter } from "./adapters/dl-adapter";
import { DigiLockerAdapter } from "./adapters/digilocker-adapter";
import { SingaporeAdapter } from "./adapters/singapore-adapter";
import { VisionAdapter } from "./adapters/vision-adapter";

export const ADAPTER_REGISTRY: Record<string, any> = {
    "PAN": new PanAdapter(),
    "DRIVING_LICENSE": new DLAdapter(),
    "DIGILOCKER": new DigiLockerAdapter(),
    "SINGAPORE": new SingaporeAdapter(),
    "VISION": new VisionAdapter(),
    // Add VOTER, GST, PASSPORT here easily
};
