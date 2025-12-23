import { PanAdapter } from "./adapters/pan-adapter";
import { DLAdapter } from "./adapters/dl-adapter";
import { DigiLockerAdapter } from "./adapters/digilocker-adapter";
import { SingaporeAdapter } from "./adapters/singapore-adapter";
import { VisionAdapter } from "./adapters/vision-adapter";
import { CrimeAdapter } from "./adapters/crime-adapter";
import { GSTAdapter } from "./adapters/gst-adapter";
import { VoterAdapter } from "./adapters/voter-adapter";

export const ADAPTER_REGISTRY: Record<string, any> = {
    "PAN": new PanAdapter(),
    "DRIVING_LICENSE": new DLAdapter(),
    "DIGILOCKER": new DigiLockerAdapter(),
    "SINGAPORE": new SingaporeAdapter(),
    "VISION": new VisionAdapter(),
    "CRIME_CHECK": new CrimeAdapter(),
    "GST": new GSTAdapter(),
    "VOTER": new VoterAdapter(),
};
