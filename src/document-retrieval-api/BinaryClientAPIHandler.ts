import { HttpAxiosClient } from "../common/client/HttpAxiosClient";
import { ClientResponse } from "../common/client/models/ClientResponse";
import { BinaryAPI } from "../common/config/models/APIs/BinaryAPI";
import { AppSettings } from "../common/config/models/AppSettings";
import { logger } from "../common/logger/Logger";
import { CommonFailedResponse } from "../common/models/CommonFailedResponse";
import { DataFileWriterUtils } from "../common/utils/DataFileWriterUtils";
import { GuidGenerator } from "../common/utils/GuidGenerator";
import { HttpResponseUtils } from "../common/utils/HttpResponseUtils";
import { URLUtils } from "../common/utils/URLUtils";
import { BinaryClientResponse } from "./models/BinaryClientResponse";

export class BinaryClientAPIHandler {

    private binaryClientAPISettings!: BinaryAPI;
    private appSettings!: AppSettings;
    private token!: string

    constructor(appSettings: AppSettings, token: string) {
        this.appSettings = appSettings;
        this.binaryClientAPISettings = appSettings.BinaryAPI;
        this.token = token;
    }


    async getBinaryFileDataAsync(fileNameIDValue?: string): Promise<BinaryClientResponse | CommonFailedResponse> {
        const {
            Accept,
            EndpointURL,
            HttpClientRequestTimeOutSeconds,
            FileNameId
        } = this.binaryClientAPISettings;

        const headers: Record<string, string> = {
            'Accept': Accept,
            'Authorization': `Bearer ${this.token}`,
        };

        fileNameIDValue = fileNameIDValue ?? FileNameId;

        const updatedEndPointURL = EndpointURL.replace("{id}", fileNameIDValue);

        const { baseUrl, resourcePath } = URLUtils.parseUrl(updatedEndPointURL);
        const timeoutMs = HttpClientRequestTimeOutSeconds * 1000;

        const httpClient = new HttpAxiosClient(baseUrl, headers, timeoutMs);


        const curlCommand = await httpClient.toCurl(resourcePath, 'GET');
        logger.info(`Outgoing cURL: ${curlCommand}`);

        const response: ClientResponse = await httpClient.get(resourcePath);

        const fileWriter: DataFileWriterUtils = new DataFileWriterUtils(this.appSettings.BaseFileLocationFolder);

        await fileWriter.writeText('binary-client-nodejs', 'curl', curlCommand);

        if (!response?.success) {
            logger.error(`Failed processing DeliveryConfirmation Data!`);
            const failedResponse = HttpResponseUtils.getFailedResponseObject(response);
            if (failedResponse.response) {
                logger.error(`Response: ${failedResponse.response}`);
                await fileWriter.writeJson('binary-client-nodejs', `response-failed-${GuidGenerator.generate()}`, failedResponse.response!);
            }

            return failedResponse;
        }

        const fileNamePostFixString = response.response?.status === 200 ? 'response-success' : 'response-failed';
        const successReponse: BinaryClientResponse = response.response!.data as BinaryClientResponse;
        await fileWriter.writeJson('binary-client-nodejs', `${fileNamePostFixString}-${GuidGenerator.generate()}`, successReponse);
        return successReponse;
    }


}