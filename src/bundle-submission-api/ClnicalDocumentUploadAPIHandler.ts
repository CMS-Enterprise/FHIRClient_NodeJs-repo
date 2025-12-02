import { UploadClinicalDocumentAPI } from "../common/config/models/APIs/UploadClinicalDocumentAPI";
import { AppSettings } from "../common/config/models/AppSettings";
import { FileUtils } from "../common/utils/FileUtils";
import { CryptoUtils } from "../common/utils/CryptoUtils";
import * as fs from 'fs/promises';
import { logger } from "../common/logger/Logger";
import { HttpAxiosClient } from "../common/client/HttpAxiosClient";
import { URLUtils } from "../common/utils/URLUtils";
import { ClientResponse } from "../common/client/models/ClientResponse";
import { DataFileWriterUtils } from "../common/utils/DataFileWriterUtils";
import { GuidGenerator } from "../common/utils/GuidGenerator";
import { HttpResponseUtils } from "../common/utils/HttpResponseUtils";
import { UploadClinicalDocumentResponse } from "./models/UploadClinicalDocumentResponse";
import { CommonFailedResponse } from "../common/models/CommonFailedResponse";

export class ClnicalDocumentUploadAPIHandler {


    private UploadClinicalDocumentAPISettings!: UploadClinicalDocumentAPI;
    private appSettings!: AppSettings;
    private token!: string


    constructor(appSettings: AppSettings, token: string) {
        this.appSettings = appSettings;
        this.UploadClinicalDocumentAPISettings = appSettings.UploadClinicalDocumentAPI;
        this.token = token;

    }


    async uploadClinicalDocumentAsync(presignedURL: string, fileName: string): Promise<UploadClinicalDocumentResponse | CommonFailedResponse> {
        const {
            ContentType,
            HttpClientRequestTimeOutSeconds,
        } = this.UploadClinicalDocumentAPISettings;


        // Read XML content from file
        //const fileName = this.UploadClinicalDocumentAPISettings.FileName;
        const fullFileNameWithPath = FileUtils.getFullFilePath({
            folder: this.appSettings.BaseFileLocationFolder,
            fileName
        });

        const xml = await fs.readFile(fullFileNameWithPath, 'utf-8');

        const contentMD5Value = CryptoUtils.computeContentMd5String(fullFileNameWithPath);
        logger.info(`ContentMD5 Value: ${contentMD5Value}`);

        const md5Buffer = CryptoUtils.convertBase64StringToBytes(contentMD5Value); // Buffer.from(contentMD5Value, 'base64');
        const base64MD5 = md5Buffer.toString('base64');

        const headers: Record<string, any> = {
            'Content-Type': ContentType,
            'Accept': '*/*',
            'Authorization': `Bearer ${this.token}`,
            'Content-Length': Buffer.byteLength(xml).toString(),
            'Content-MD5': base64MD5
        };



        const { baseUrl, resourcePath, params } = URLUtils.parseUrl(presignedURL);
        const timeoutMs = HttpClientRequestTimeOutSeconds * 1000;

        const httpClient = new HttpAxiosClient(baseUrl, headers, timeoutMs, params);

        const curlCommand = await httpClient.toCurl(resourcePath, 'POST', xml, URLUtils.paramsToQueryString(params));
        logger.info(`Outgoing cURL: ${curlCommand}`);

        const response: ClientResponse = await httpClient.postXMLData(resourcePath, xml);

        const fileWriter: DataFileWriterUtils = new DataFileWriterUtils(this.appSettings.BaseFileLocationFolder);

        await fileWriter.writeJson('upload-clinical-document-nodejs', `Request-${GuidGenerator.generate()}`, xml);

        await fileWriter.writeText('upload-clinical-document-nodejs', 'curl', curlCommand);

        if (!response?.success) {
            logger.error(`Failed processing presigned URL API Request Data!`);
            const failedResponse = HttpResponseUtils.getFailedResponseObject(response);
            if (failedResponse.response) {
                logger.error(`Response: ${failedResponse.response}`);
                await fileWriter.writeJson('upload-clinical-document-nodejs', `response-failed-${GuidGenerator.generate()}`, failedResponse.response!);
            }

            return failedResponse;
        }

        const fileNamePostFixString = response.response?.status === 200 ? 'response-success' : 'response-failed';
        const successReponse: UploadClinicalDocumentResponse = response.response!.data as UploadClinicalDocumentResponse;
        await fileWriter.writeJson('upload-clinical-document-nodejs', `${fileNamePostFixString}-${GuidGenerator.generate()}`, successReponse);
        return successReponse;
    }




}