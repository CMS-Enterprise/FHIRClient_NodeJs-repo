import { HttpAxiosClient } from "../common/client/HttpAxiosClient";
import { ClientResponse } from "../common/client/models/ClientResponse";
import { DocumentRetrievalAPI } from "../common/config/models/APIs/DocumentRetrievalAPI";
import { AppSettings } from "../common/config/models/AppSettings";
import { logger } from "../common/logger/Logger";
import { CommonFailedResponse } from "../common/models/CommonFailedResponse";
import { DataFileWriterUtils } from "../common/utils/DataFileWriterUtils";
import { GuidGenerator } from "../common/utils/GuidGenerator";
import { HttpResponseUtils } from "../common/utils/HttpResponseUtils";
import { URLUtils } from "../common/utils/URLUtils";
import { DocumentRetrievalResponse } from "./models/DocumentRetrievalResponse";

export class DocumentRetrievalAPIHandler {


    private documentRetrievalAPISettings!: DocumentRetrievalAPI;
    private appSettings!: AppSettings;
    private token!: string

    constructor(appSettings: AppSettings, token: string) {
        this.appSettings = appSettings;
        this.documentRetrievalAPISettings = appSettings.DocumentRetrievalAPI;
        this.token = token;
    }

      async getDocumentRetrievalDataAsync(): Promise<DocumentRetrievalResponse | CommonFailedResponse> {
        const {
            Accept,
            EndpointURL,
            HttpClientRequestTimeOutSeconds,
            RequestParameters,
        } = this.documentRetrievalAPISettings;

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

        await fileWriter.writeText('document-retrieval-nodejs', 'curl', curlCommand);

        if (!response?.success) {
            logger.error(`Failed processing document Retrieval Data!`);
            const failedResponse = HttpResponseUtils.getFailedResponseObject(response);
            if (failedResponse.response) {
                logger.error(`Response: ${failedResponse.response}`);
                await fileWriter.writeJson('document-retrieval-nodejs', `response-failed-${GuidGenerator.generate()}`, failedResponse.response!);
            }

            return failedResponse;
        }

        const fileNamePostFixString = response.response?.status === 200 ? 'response-success' : 'response-failed';
        const successReponse: DocumentRetrievalResponse = response.response!.data as DocumentRetrievalResponse;
        await fileWriter.writeJson('document-retrieval-nodejs', `${fileNamePostFixString}-${GuidGenerator.generate()}`, successReponse);
        return successReponse;
    }

}