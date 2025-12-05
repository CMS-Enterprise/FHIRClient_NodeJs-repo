import { HttpAxiosClient } from "../common/client/HttpAxiosClient";
import { ClientResponse } from "../common/client/models/ClientResponse";
import { DeliveryConfirmationAPI } from "../common/config/models/APIs/DeliveryConfirmationAPI";
import { AppSettings } from "../common/config/models/AppSettings";
import { logger } from "../common/logger/Logger";
import { CommonFailedResponse } from "../common/models/CommonFailedResponse";
import { DataFileWriterUtils } from "../common/utils/DataFileWriterUtils";
import { GuidGenerator } from "../common/utils/GuidGenerator";
import { HttpResponseUtils } from "../common/utils/HttpResponseUtils";
import { URLUtils } from "../common/utils/URLUtils";
import { DeliveryConfirmationResponse } from "./models/DeliveryConfirmationResponse";

export class DeliveryConfirmationAPIHandler {

    private deliveryConfirmationAPISettings!: DeliveryConfirmationAPI;
    private appSettings!: AppSettings;
    private token!: string

    constructor(appSettings: AppSettings, token: string) {
        this.appSettings = appSettings;
        this.deliveryConfirmationAPISettings = appSettings.DeliveryConfirmationAPI;
        this.token = token;
    }


    async processDeliveryConfirmationAsync(): Promise<DeliveryConfirmationResponse | CommonFailedResponse> {
        const {
            ContentType,
            Accept,
            EndpointURL,
            HttpClientRequestTimeOutSeconds,
            Request
        } = this.deliveryConfirmationAPISettings;

        const headers: Record<string, string> = {
            'Content-Type': ContentType,
            'Accept': Accept,
            'Authorization': `Bearer ${this.token}`,
        };

        const { baseUrl, resourcePath } = URLUtils.parseUrl(EndpointURL);
        const timeoutMs = HttpClientRequestTimeOutSeconds * 1000;

        const httpClient = new HttpAxiosClient(baseUrl, headers, timeoutMs);

        const curlCommand = await httpClient.toCurl(resourcePath, 'POST', Request);
        logger.info(`Outgoing cURL: ${curlCommand}`);

        const response: ClientResponse = await httpClient.post(resourcePath, Request);

        const fileWriter: DataFileWriterUtils = new DataFileWriterUtils(this.appSettings.BaseFileLocationFolder);

        await fileWriter.writeJson('delivery-confirmation-nodejs', `request-${GuidGenerator.generate()}`, Request);

        await fileWriter.writeText('delivery-confirmation-nodejs', 'curl', curlCommand);

        if (!response?.success) {
            logger.error(`Failed processing DeliveryConfirmation Data!`);
            const failedResponse = HttpResponseUtils.getFailedResponseObject(response);
            if ( failedResponse.response) {
                logger.error(`Response: ${failedResponse.response}`);
                await fileWriter.writeJson('delivery-confirmation-nodejs', `response-failed-${GuidGenerator.generate()}`, failedResponse.response!);
            }

            return failedResponse;
        }

        const fileNamePostFixString = response.response?.status === 200 ? 'response-success' : 'response-failed';
        const successReponse: DeliveryConfirmationResponse = response.response!.data as DeliveryConfirmationResponse;
        await fileWriter.writeJson('delivery-confirmation-nodejs', `${fileNamePostFixString}-${GuidGenerator.generate()}`, successReponse);
        return successReponse;
    }


}