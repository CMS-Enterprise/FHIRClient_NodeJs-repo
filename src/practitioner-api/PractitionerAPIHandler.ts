import { HttpAxiosClient } from "../common/client/HttpAxiosClient";
import { ClientResponse } from "../common/client/models/ClientResponse";
import { DeliveryConfirmationAPI } from "../common/config/models/APIs/DeliveryConfirmationAPI";
import { PractitionerAPI } from "../common/config/models/APIs/PractitionerAPI";
import { AppSettings } from "../common/config/models/AppSettings";
import { logger } from "../common/logger/Logger";
import { CommonFailedResponse } from "../common/models/CommonFailedResponse";
import { DataFileWriterUtils } from "../common/utils/DataFileWriterUtils";
import { GuidGenerator } from "../common/utils/GuidGenerator";
import { HttpResponseUtils } from "../common/utils/HttpResponseUtils";
import { URLUtils } from "../common/utils/URLUtils";
import { PractitionerResponse } from "./models/PractitionerResponse";

export class PractitionerAPIHandler {

    private practitionerAPISettings!: PractitionerAPI;
    private appSettings!: AppSettings;
    private token!: string

    constructor(appSettings: AppSettings, token: string) {
        this.appSettings = appSettings;
        this.practitionerAPISettings = appSettings.PractitionerAPI;
        this.token = token;
    }


    async processPractitionerRequestAsync(practitionerId?: string): Promise<PractitionerResponse | CommonFailedResponse> {
        const {
            ContentType,
            Accept,
            EndpointURL,
            HttpClientRequestTimeOutSeconds,
            Request
        } = this.practitionerAPISettings;

        const headers: Record<string, string> = {
            'Content-Type': ContentType,
            'Accept': Accept,
            'Authorization': `Bearer ${this.token}`,
        };

        practitionerId = practitionerId ?? Request.id;

        const updatedEndPointURL = EndpointURL.replace("{id}", practitionerId);
       
        const { baseUrl, resourcePath } = URLUtils.parseUrl(updatedEndPointURL);
        const timeoutMs = HttpClientRequestTimeOutSeconds * 1000;

        const httpClient = new HttpAxiosClient(baseUrl, headers, timeoutMs);

        const curlCommand = await httpClient.toCurl(resourcePath, 'PUT', Request);
        logger.info(`Outgoing cURL: ${curlCommand}`);

        const response: ClientResponse = await httpClient.put(resourcePath, Request);

        const fileWriter: DataFileWriterUtils = new DataFileWriterUtils(this.appSettings.BaseFileLocationFolder);

        
        await fileWriter.writeJson('practitioner-nodejs', `request-${GuidGenerator.generate()}`, Request);

        await fileWriter.writeText('practitioner-nodejs', 'curl', curlCommand);

        if (!response?.success) {
            logger.error(`Failed processing Practitioner API Request Data!`);
            const failedResponse = HttpResponseUtils.getFailedResponseObject(response);
            if (failedResponse.response) {
                logger.error(`Response: ${failedResponse.response}`);
                await fileWriter.writeJson('practitioner-nodejs', `response-failed-${GuidGenerator.generate()}`, failedResponse.response!);
            }

            return failedResponse;
        }

        const fileNamePostFixString = response.response?.status === 200 ? 'response-success' : 'response-failed';
        const successReponse: PractitionerResponse = response.response!.data as PractitionerResponse;
        await fileWriter.writeJson('practitioner-nodejs', `${fileNamePostFixString}-${GuidGenerator.generate()}`, successReponse);
        return successReponse;
    }


}