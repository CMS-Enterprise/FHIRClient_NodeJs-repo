import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';
import { logger } from '../logger/Logger';
import { ClientResponse } from './models/ClientResponse';

export class HttpAxiosClient {

    private client: AxiosInstance;
    private config: AxiosRequestConfig;

    /**
      * @param baseURL - FHIR server base URL
      * @param headers - optional headers object to set on every request
      */
    constructor(baseURL: string, headers?: Record<string, any>, timeout?: number, params?: Record<string, string>) {
        const config: AxiosRequestConfig = {
            baseURL,
            headers: {
                'Content-Type': 'application/fhir+json',
                ...headers,  // Spread user headers, overrides default if conflicts
            },
            timeout: timeout,
            maxBodyLength: Infinity,
            params: params
        };
        this.config = config;
        this.client = axios.create(config);
    }

    async toCurl(resource?: string, httpMethod?: string, data?: any, paramQuery?: string): Promise<string> {
        const method = (httpMethod ?? this.config.method ?? 'GET').toUpperCase();

        const baseURL = this.config.baseURL?.replace(/\/$/, '') ?? '';
        const endpoint = resource ?? this.config.url ?? '';
        const url = `${baseURL}${endpoint}`;

        const curlParts: string[] = [`curl -X ${method}`];

        // Add headers
        if (this.config.headers && typeof this.config.headers === 'object') {
            for (const [key, value] of Object.entries(this.config.headers)) {
                curlParts.push(`-H "${key}: ${value}"`);
            }
        }

        // Add data (prioritize method argument if provided)
        const payload = data ?? this.config.data;
        if (payload !== undefined) {
            const dataStr = typeof payload === 'object' ? JSON.stringify(payload) : String(payload);
            curlParts.push(`--data '${dataStr}'`);
        }

        paramQuery = paramQuery ?? '';
        // Final URL
        curlParts.push(`"${url}${paramQuery}"`);

        return curlParts.join(' ');
    }

    async get(resource: string): Promise<ClientResponse> {
        const clientResponse: ClientResponse = {
            success: false
        }
        try {
            logger.info(`GET ${resource}`);
            const response = await this.client.get(resource);
            logger.info(`GET Response: [${response.status}]: ${JSON.stringify(response.data)}`);
            clientResponse.success = true;
            clientResponse.response = response;
            return clientResponse;
        } catch (error) {
            clientResponse.error = error;
            let message = 'GET Error';
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                const description = error.response?.statusText;
                if (status && description) {
                    message = `HTTP ${status}: ${description}`;
                }
                if (error.code === 'ECONNABORTED') {
                    message = `Request timed out: ${error.message}`;
                }
                logger.error(`GET Error: ${message}`);
            }
            else {
                logger.error(`GET Error: ${error}`);
            }
            return clientResponse;
        }
    }

    async post(resource: string, data?: object): Promise<ClientResponse> {
        const clientResponse: ClientResponse = {
            success: false
        }
        try {
            if (data) {
                logger.info(`POST ${resource} - Data: ${JSON.stringify(data)}`);
            }
            const response = data ? await this.client.post(resource, data) : await this.client.post(resource);
            logger.info(`POST Response:  [${response.status}]: ${JSON.stringify(response.data)}`);
            clientResponse.success = true;
            clientResponse.response = response;
            return clientResponse;
        } catch (error) {
            clientResponse.error = error;
            let message = 'POST Error';
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                const description = error.response?.statusText;
                if (status && description) {
                    message = `HTTP ${status}: ${description}`;
                }
                if (error.code === 'ECONNABORTED') {
                    message = `Request timed out: ${error.message}`;
                }
                logger.error(`GET Error: ${message}`);
            }
            else {
                logger.error(`POST Error: ${error}`);
            }
            return clientResponse;
        }
    }

    async postXMLData(resource: string, data: string): Promise<ClientResponse> {
        const clientResponse: ClientResponse = {
            success: false
        }
        try {
            if (data) {
                logger.info(`POST ${resource} - Data: ${data}`);
            }
            const response = await this.client.post(resource, data);
            logger.info(`POST Response:  [${response.status}]: ${JSON.stringify(response.data)}`);
            clientResponse.success = true;
            clientResponse.response = response;
            return clientResponse;
        } catch (error) {
            clientResponse.error = error;
            let message = 'POST Error';
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                const description = error.response?.statusText;
                if (status && description) {
                    message = `HTTP ${status}: ${description}`;
                }
                if (error.code === 'ECONNABORTED') {
                    message = `Request timed out: ${error.message}`;
                }
                logger.error(`GET Error: ${message}`);
            }
            else {
                logger.error(`POST Error: ${error}`);
            }
            return clientResponse;
        }
    }

    async put(resource: string, data: object): Promise<ClientResponse> {
        const clientResponse: ClientResponse = {
            success: false
        }
        try {
            if (data) {
                logger.info(`PUT ${resource} - Data: ${JSON.stringify(data)}`);
            }
            const response = data ? await this.client.put(resource, data) : await this.client.put(resource);
            logger.info(`PUT Response:  [${response.status}]: ${JSON.stringify(response.data)}`);
            clientResponse.success = true;
            clientResponse.response = response;
            return clientResponse;
        } catch (error) {
            clientResponse.error = error;
            let message = 'PUT Error';
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                const description = error.response?.statusText;
                if (status && description) {
                    message = `HTTP ${status}: ${description}`;
                    clientResponse.response = error.response;
                }
                if (error.code === 'ECONNABORTED') {
                    message = `Request timed out: ${error.message}`;
                }
                logger.error(`PUT Error: ${message}`);
            }
            else {
                logger.error(`PUT Error: ${error}`);
            }
            return clientResponse;
        }
    }

    async delete(resource: string): Promise<ClientResponse> {
        const clientResponse: ClientResponse = {
            success: false
        }
        try {
            logger.info(`DELETE ${resource}`);
            const response = await this.client.delete(resource);
            logger.info(`DELETE Response:  [${response.status}]: ${JSON.stringify(response.data)}`);
            clientResponse.success = true;
            clientResponse.response = response;
            return clientResponse;
        } catch (error) {
            clientResponse.error = error;
            let message = 'DETELE Error';
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                const description = error.response?.statusText;
                if (status && description) {
                    message = `HTTP ${status}: ${description}`;
                }
                if (error.code === 'ECONNABORTED') {
                    message = `Request timed out: ${error.message}`;
                }
                logger.error(`GET Error: ${message}`);
            }
            else {
                logger.error(`DELETE Error: ${error}`);
            }
            return clientResponse;
        }
    }
}
