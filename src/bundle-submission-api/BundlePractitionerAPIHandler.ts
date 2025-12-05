import { json } from "stream/consumers";
import { HttpAxiosClient } from "../common/client/HttpAxiosClient";
import { ClientResponse } from "../common/client/models/ClientResponse";
import { BundlePractitionerAPI } from "../common/config/models/APIs/BundlePractitionerAPI";
import { AppSettings } from "../common/config/models/AppSettings";
import { logger } from "../common/logger/Logger";
import { CommonFailedResponse } from "../common/models/CommonFailedResponse";
import { DataFileWriterUtils } from "../common/utils/DataFileWriterUtils";
import { GuidGenerator } from "../common/utils/GuidGenerator";
import { HttpResponseUtils } from "../common/utils/HttpResponseUtils";
import { URLUtils } from "../common/utils/URLUtils";
import { BundlePractitionerResponse } from "./models/BundlePractitionerResponse";

export class BundlePractitionerAPIHandler {

    private bundlePractitionerAPISettings!: BundlePractitionerAPI;
    private appSettings!: AppSettings;
    private token!: string

    constructor(appSettings: AppSettings, token: string) {
        this.appSettings = appSettings;
        this.bundlePractitionerAPISettings = appSettings.BundlePractitionerAPI;
        this.token = token;
    }


    async processBundlePractitionerRequestAsync(guid?: string): Promise<BundlePractitionerResponse | CommonFailedResponse> {
        const {
            ContentType,
            Accept,
            EndpointURL,
            HttpClientRequestTimeOutSeconds,
            Request
        } = this.bundlePractitionerAPISettings;

        const headers: Record<string, string> = {
            'Content-Type': ContentType,
            'Accept': Accept,
            'Authorization': `Bearer ${this.token}`,
        };

        const id = guid ?? GuidGenerator.generate();

        const requestStr = JSON.stringify(Request).replace(/\$\{PractitionerIdValue\}/g, id);
        const updatedRequest = JSON.parse(requestStr);


        const { baseUrl, resourcePath } = URLUtils.parseUrl(EndpointURL);
        const timeoutMs = HttpClientRequestTimeOutSeconds * 1000;

        const httpClient = new HttpAxiosClient(baseUrl, headers, timeoutMs);

        const curlCommand = await httpClient.toCurl(resourcePath, 'POST', updatedRequest);
        logger.info(`Outgoing cURL: ${curlCommand}`);

        const response: ClientResponse = await httpClient.post(resourcePath, updatedRequest);

        const fileWriter: DataFileWriterUtils = new DataFileWriterUtils(this.appSettings.BaseFileLocationFolder);

        await fileWriter.writeJson('bundle-practitioner-nodejs', `request-${id}`, updatedRequest);

        await fileWriter.writeText('bundle-practitioner-nodejs', 'curl', curlCommand);

        if (!response?.success) {
            logger.error(`Failed processing Bundle Practitioner API Request Data!`);
            const failedResponse = HttpResponseUtils.getFailedResponseObject(response);
            if (failedResponse.response) {
                logger.error(`Response: ${failedResponse.response}`);
                await fileWriter.writeJson('bundle-practitioner-nodejs', `response-failed-${id}`, failedResponse.response!);
            }

            return failedResponse;
        }
        const fileNamePostFixString = response.response?.status === 200 ? 'response-success' : 'response-failed';
        const successReponse: BundlePractitionerResponse = response.response!.data as BundlePractitionerResponse;
        await fileWriter.writeJson('bundle-practitioner-nodejs', `${fileNamePostFixString}-${id}`, successReponse);
        return successReponse;
    }


}