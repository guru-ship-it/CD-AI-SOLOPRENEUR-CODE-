import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import CircuitBreaker from 'opossum';
import * as logger from "firebase-functions/logger";

/**
 * Configure Global Axios Instance with Automatic Retries
 */
const client = axios.create({
    timeout: 10000, // 10s default timeout
});

axiosRetry(client, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
        // Only retry on network errors or 5xx Server errors (not 400 Bad Request)
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || (error.response?.status ? error.response.status >= 500 : false);
    }
});

/**
 * Circuit Breaker Configuration
 */
const breakerOptions = {
    timeout: 10000, // If the function takes longer than 10s, trigger a failure
    errorThresholdPercentage: 50, // When 50% of requests fail, open the circuit
    resetTimeout: 30000 // After 30s, try again (half-open)
};

const breaker = new CircuitBreaker(async (config: AxiosRequestConfig): Promise<AxiosResponse> => {
    return await client(config);
}, breakerOptions);

breaker.on('open', () => logger.warn('CIRCUIT BREAKER: OPEN - External API calls are being blocked to prevent cascading failure.'));
breaker.on('halfOpen', () => logger.info('CIRCUIT BREAKER: HALF-OPEN - Testing API connectivity.'));
breaker.on('close', () => logger.info('CIRCUIT BREAKER: CLOSED - External API health restored.'));

/**
 * Centrally managed resilient API call
 */
export async function resilientCall(config: AxiosRequestConfig) {
    try {
        const response = await breaker.fire(config);
        return response;
    } catch (error: any) {
        if (breaker.opened) {
            throw new Error('SERVICE_TEMPORARILY_UNAVAILABLE: The circuit breaker is open.');
        }
        throw error;
    }
}

export default client;
