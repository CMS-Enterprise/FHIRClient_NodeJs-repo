
import { HttpAxiosClient } from "../common/client/HttpAxiosClient";
import { AuthenticationAPI } from "../common/config/models/APIs/AuthenticationAPI";
import { Token } from "./models/Token";
import { CommonFailedResponse } from "../common/models/CommonFailedResponse";
import { ClientResponse } from "../common/client/models/ClientResponse";
import { URLUtils } from "../common/utils/URLUtils";
import { ParsedUrl } from "../common/config/models/ParsedUrl";
import { logger } from '../common/logger/Logger';
import { HttpResponseUtils } from "../common/utils/HttpResponseUtils";
import { AppSettings } from "../common/config/models/AppSettings";
import { DataFileWriterUtils } from "../common/utils/DataFileWriterUtils";
import { GuidGenerator } from "../common/utils/GuidGenerator";



export class AuthenticationAPIHandler {

    private authenticationAPISettings!: AuthenticationAPI;
    private appSettings!: AppSettings;
    private cachedToken?: Token;

    constructor(appSettings: AppSettings) {
        this.appSettings = appSettings;
        this.authenticationAPISettings = appSettings.AuthenticationAPI;
    }

    async getToken(): Promise<Token | CommonFailedResponse> {
        // Return cached token if still valid
        if (this.isTokenValid(this.cachedToken)) {
            return this.cachedToken!;
        }

        const {
            ContentType,
            ClientId,
            ClientSecret,
            Scope,
            EndpointURL,
            HttpClientRequestTimeOutSeconds
        } = this.authenticationAPISettings;

        const headers: Record<string, string> = {
            'Content-Type': ContentType,
            'clientid': ClientId,
            'clientsecret': ClientSecret,
            'scope': Scope,
        };

        const { baseUrl, resourcePath } = URLUtils.parseUrl(EndpointURL);
        const timeoutMs = HttpClientRequestTimeOutSeconds * 1000;

        const httpClient = new HttpAxiosClient(baseUrl, headers, timeoutMs);

        const curlCommand = await httpClient.toCurl(resourcePath);
        logger.info(`Token request (cURL): ${curlCommand}`);

        const response: ClientResponse = await httpClient.post(resourcePath);

        const fileWriter: DataFileWriterUtils = new DataFileWriterUtils(this.appSettings.BaseFileLocationFolder);

        await fileWriter.writeText('authentication-nodejs', 'curl', curlCommand);


        if (!response?.success || !response.response?.data) {
            logger.error(`Failed to retrieve token.`);
            const failedResponse = HttpResponseUtils.getFailedResponseObject(response);
            if (failedResponse.response) {
                logger.error(`Response: ${failedResponse.response}`);
                await fileWriter.writeJson('authentication-nodejs', `response-failed-${GuidGenerator.generate()}`, failedResponse.response!);
            }
            return failedResponse;
        }

        const tokenData = response.response.data as Omit<Token, 'IssuedAt'> & { IssuedAt?: string };
        const issuedAt = tokenData.IssuedAt ? new Date(tokenData.IssuedAt) : new Date();

        this.cachedToken = {
            ...tokenData,
            IssuedAt: issuedAt
        };

        logger.info(`Token successfully retrieved and cached.`);
        await fileWriter.writeJson('authentication-nodejs', `response-success-${GuidGenerator.generate()}`, this.cachedToken);
        return this.cachedToken;
    }

    private isTokenValid(token?: Token): boolean {
        if (!token || !token.IssuedAt || !token.expires_in) {
            return false;
        }

        const now = new Date();
        const expiresAt = new Date(token.IssuedAt.getTime() + token.expires_in * 1000);

        // Consider token expired 1 minute before actual expiry to be safe
        const bufferMs = 60 * 1000;
        return now.getTime() < (expiresAt.getTime() - bufferMs);
    }



}