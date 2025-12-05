import { HttpAxiosClient } from "../common/client/HttpAxiosClient";
import { ClientResponse } from "../common/client/models/ClientResponse";
import { NotificationRetrievalAPI } from "../common/config/models/APIs/NotificationRetrievalAPI";
import { AppSettings } from "../common/config/models/AppSettings";
import { logger } from "../common/logger/Logger";
import { CommonFailedResponse } from "../common/models/CommonFailedResponse";
import { DataFileWriterUtils } from "../common/utils/DataFileWriterUtils";
import { GuidGenerator } from "../common/utils/GuidGenerator";
import { HttpResponseUtils } from "../common/utils/HttpResponseUtils";
import { URLUtils } from "../common/utils/URLUtils";
import { NotificationResponse } from "./models/NotificationResponse";

export class NotificationAPIHander {


    private notificationAPISettings!: NotificationRetrievalAPI;
    private appSettings!: AppSettings;
    private token!: string

    constructor(appSettings: AppSettings, token: string) {
        this.appSettings = appSettings;
        this.notificationAPISettings = appSettings.NotificationRetrievalAPI;
        this.token = token;
    }


    async getNotificationsAsync(): Promise<NotificationResponse | CommonFailedResponse> {
        const {
            Accept,
            EndpointURL,
            HttpClientRequestTimeOutSeconds,
            RequestParameters,
        } = this.notificationAPISettings;

        const headers: Record<string, string> = {
            'Accept': Accept,
            'Authorization': `Bearer ${this.token}`,
        };

        const queryParams: { [key: string]: string } = {};
        // Extract params
        RequestParameters?.forEach(param => {
            if (param.inject && param.name && param.value) {
                queryParams[param.name] = param.value;
            }
        });


        // Convert to query string
        const queryString = new URLSearchParams(queryParams).toString();

        const { baseUrl, resourcePath } = URLUtils.parseUrl(EndpointURL);
        const timeoutMs = HttpClientRequestTimeOutSeconds * 1000;

        const httpClient = new HttpAxiosClient(baseUrl, headers, timeoutMs);

        const resourcePathWithQuery = queryString ? `${resourcePath}?${queryString}` : resourcePath;

        const curlCommand = await httpClient.toCurl(resourcePathWithQuery, 'GET');
        logger.info(`Outgoing cURL: ${curlCommand}`);

        const response: ClientResponse = await httpClient.get(resourcePath);

        const fileWriter: DataFileWriterUtils = new DataFileWriterUtils(this.appSettings.BaseFileLocationFolder);

        await fileWriter.writeText('notification-retrieval-nodejs', 'curl', curlCommand);

        if (!response?.success) {
            logger.error(`Failed processing Notification Retrieval Data!`);
            const failedResponse = HttpResponseUtils.getFailedResponseObject(response);
            if (failedResponse.response) {
                logger.error(`Response: ${failedResponse.response}`);
                await fileWriter.writeJson('notification-retrieval-nodejs', `response-failed-${GuidGenerator.generate()}`, failedResponse.response!);
            }

            return failedResponse;
        }

        const fileNamePostFixString = response.response?.status === 200 ? 'response-success' : 'response-failed';
        const successReponse: NotificationResponse = response.response!.data as NotificationResponse;
        await fileWriter.writeJson('notification-retrieval-nodejs', `${fileNamePostFixString}-${GuidGenerator.generate()}`, successReponse);
        return successReponse;
    }


}