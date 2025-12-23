"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resilientCall = resilientCall;
const axios_1 = __importDefault(require("axios"));
const axios_retry_1 = __importDefault(require("axios-retry"));
const opossum_1 = __importDefault(require("opossum"));
const logger = __importStar(require("firebase-functions/logger"));
const client = axios_1.default.create({
    timeout: 10000,
});
(0, axios_retry_1.default)(client, {
    retries: 3,
    retryDelay: axios_retry_1.default.exponentialDelay,
    retryCondition: (error) => {
        return axios_retry_1.default.isNetworkOrIdempotentRequestError(error) || (error.response?.status ? error.response.status >= 500 : false);
    }
});
const breakerOptions = {
    timeout: 10000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000
};
const breaker = new opossum_1.default(async (config) => {
    return await client(config);
}, breakerOptions);
breaker.on('open', () => logger.warn('CIRCUIT BREAKER: OPEN - External API calls are being blocked to prevent cascading failure.'));
breaker.on('halfOpen', () => logger.info('CIRCUIT BREAKER: HALF-OPEN - Testing API connectivity.'));
breaker.on('close', () => logger.info('CIRCUIT BREAKER: CLOSED - External API health restored.'));
async function resilientCall(config) {
    try {
        const response = await breaker.fire(config);
        return response;
    }
    catch (error) {
        if (breaker.opened) {
            throw new Error('SERVICE_TEMPORARILY_UNAVAILABLE: The circuit breaker is open.');
        }
        throw error;
    }
}
exports.default = client;
//# sourceMappingURL=api-client.js.map