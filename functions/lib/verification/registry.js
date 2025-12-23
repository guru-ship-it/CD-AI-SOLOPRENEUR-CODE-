"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ADAPTER_REGISTRY = void 0;
const pan_adapter_1 = require("./adapters/pan-adapter");
const dl_adapter_1 = require("./adapters/dl-adapter");
const digilocker_adapter_1 = require("./adapters/digilocker-adapter");
const singapore_adapter_1 = require("./adapters/singapore-adapter");
const vision_adapter_1 = require("./adapters/vision-adapter");
const crime_adapter_1 = require("./adapters/crime-adapter");
exports.ADAPTER_REGISTRY = {
    "PAN": new pan_adapter_1.PanAdapter(),
    "DRIVING_LICENSE": new dl_adapter_1.DLAdapter(),
    "DIGILOCKER": new digilocker_adapter_1.DigiLockerAdapter(),
    "SINGAPORE": new singapore_adapter_1.SingaporeAdapter(),
    "VISION": new vision_adapter_1.VisionAdapter(),
    "CRIME_CHECK": new crime_adapter_1.CrimeAdapter(),
};
//# sourceMappingURL=registry.js.map