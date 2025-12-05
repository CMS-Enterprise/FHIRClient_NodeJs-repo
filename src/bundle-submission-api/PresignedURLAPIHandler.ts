import { HttpAxiosClient } from "../common/client/HttpAxiosClient";
import { ClientResponse } from "../common/client/models/ClientResponse";
import { PresignedURLAPI } from "../common/config/models/APIs/PresignedURLAPI";
import { AppSettings } from "../common/config/models/AppSettings";
import { logger } from "../common/logger/Logger";
import { CommonFailedResponse } from "../common/models/CommonFailedResponse";
import { CryptoUtils } from "../common/utils/CryptoUtils";
import { DataFileWriterUtils } from "../common/utils/DataFileWriterUtils";
import { FileUtils } from "../common/utils/FileUtils";
import { GuidGenerator } from "../common/utils/GuidGenerator";
import { HttpResponseUtils } from "../common/utils/HttpResponseUtils";
import { URLUtils } from "../common/utils/URLUtils";
import { BundlePractitionerResponse } from "./models/BundlePractitionerResponse";
import { PresignedURLInfo } from "./models/PresignedURLInfo";
import { Part, PresignedURLResponse } from "./models/PresignedURLResponse";

export class PresignedURLAPIHandler {


    private presignedURLAPISettings!: PresignedURLAPI;
    private appSettings!: AppSettings;
    private token!: string

    constructor(appSettings: AppSettings, token: string) {
        this.appSettings = appSettings;
        this.presignedURLAPISettings = appSettings.PresignedURLAPI;
        this.token = token;
    }


    async getPresignedURLAsync(guidId: string): Promise<PresignedURLResponse | CommonFailedResponse> {
        const {
            ContentType,
            Accept,
            EndpointURL,
            HttpClientRequestTimeOutSeconds,
            Request
        } = this.presignedURLAPISettings;


        const headers: Record<string, string> = {
            'Content-Type': ContentType,
            'Accept': Accept,
            'Authorization': `Bearer ${this.token}`,
        };



        let fileName: string = '';
        let contentMD5Part: Part | null = null;
        let fileSizePart: Part | null = null;

        Request.id =
            (!Request.id && !guidId)
                ? GuidGenerator.generate()
                : (guidId ? guidId : Request.id);

        // Loop through Request parameters
        for (const parameter of Request.parameter ?? []) {
            if (parameter.part) {
                for (const part of parameter.part) {
                    if (!part) continue;

                    switch (part.name) {
                        case 'filename':
                            fileName = part.valueString ?? '';
                            break;
                        case 'content-md5':
                            contentMD5Part = part;
                            break;
                        case 'filesize':
                            fileSizePart = part;
                            break;
                    }
                }

                const fullFileNameWithPath = FileUtils.getFullFilePath({
                    folder: this.appSettings.BaseFileLocationFolder,
                    fileName
                });

                if (contentMD5Part && !contentMD5Part.valueString) {
                    const value = CryptoUtils.computeContentMd5String(fullFileNameWithPath);
                    logger.info(`ContentMD5 Value: ${value}`);
                    contentMD5Part.valueString = value;
                }

                if (fileSizePart && !fileSizePart.valueString) {
                    fileSizePart.valueString = FileUtils.getFileSizeInMB(fullFileNameWithPath).toString();
                }
            }
        }


        const { baseUrl, resourcePath } = URLUtils.parseUrl(EndpointURL);
        const timeoutMs = HttpClientRequestTimeOutSeconds * 1000;

        const httpClient = new HttpAxiosClient(baseUrl, headers, timeoutMs);

        const curlCommand = await httpClient.toCurl(resourcePath, 'POST', Request);
        logger.info(`Outgoing cURL: ${curlCommand}`);

        const response: ClientResponse = await httpClient.post(resourcePath, Request);

        const fileWriter: DataFileWriterUtils = new DataFileWriterUtils(this.appSettings.BaseFileLocationFolder);

        await fileWriter.writeJson('presigned-url-nodejs', `Request-${Request.id}`, Request);

        await fileWriter.writeText('presigned-url-nodejs', 'curl', curlCommand);

        if (!response?.success) {
            logger.error(`Failed processing presigned URL API Request Data!`);
            const failedResponse = HttpResponseUtils.getFailedResponseObject(response);
            if (failedResponse.response) {
                logger.error(`Response: ${failedResponse.response}`);
                await fileWriter.writeJson('presigned-url-nodejs', `response-failed-${Request.id}`, failedResponse.response!);
            }

            return failedResponse;
        }

        const fileNamePostFixString = response.response?.status === 200 ? 'response-success' : 'response-failed';
        const successReponse: BundlePractitionerResponse = response.response!.data as BundlePractitionerResponse;
        await fileWriter.writeJson('presigned-url-nodejs', `${fileNamePostFixString}-${Request.id}`, successReponse);
        return successReponse;
    }

    async processPresignedURLResponse(presignedURLAPIResponse: PresignedURLResponse): Promise<PresignedURLInfo[]> {
        const presignedURLInfoList: PresignedURLInfo[] = [];


        presignedURLAPIResponse?.parameter?.forEach(parameter => {
            if (parameter.part) {
                const presignedURLInfo = new PresignedURLInfo();
                presignedURLInfoList.push(presignedURLInfo);

                parameter.part.forEach(part => {
                    part?.part?.forEach(partItem => {
                        if (partItem.valueString != null) {
                            presignedURLInfo.partValueString = {
                                name: partItem.name,
                                valueString: partItem.valueString
                            };
                        } else if (partItem.valueUrl != null) {
                            presignedURLInfo.partValueUrl = {
                                name: partItem.name,
                                valueUrl: partItem.valueUrl
                            };
                        }
                    });
                });
            }
        });

        logger.info(`Presigned URL Info List ${JSON.stringify(presignedURLInfoList)}`);

        return presignedURLInfoList;
    }


}




