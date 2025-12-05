import { HttpAxiosClient } from "../common/client/HttpAxiosClient";
import { ClientResponse } from "../common/client/models/ClientResponse";
import { BundleSubmissionAPI, DocumentReference, ListResource } from "../common/config/models/APIs/BundleSubmissionAPI";
import { AppSettings } from "../common/config/models/AppSettings";
import { logger } from "../common/logger/Logger";
import { CommonFailedResponse } from "../common/models/CommonFailedResponse";
import { CryptoUtils } from "../common/utils/CryptoUtils";
import { DataFileWriterUtils } from "../common/utils/DataFileWriterUtils";
import { DateTimeUtil } from "../common/utils/DateTimeUtil";
import { FileUtils } from "../common/utils/FileUtils";
import { GuidGenerator } from "../common/utils/GuidGenerator";
import { HttpResponseUtils } from "../common/utils/HttpResponseUtils";
import { RequestTransformerUtil } from "../common/utils/RequestTransformerUtil";
import { URLUtils } from "../common/utils/URLUtils";
import { BundlePractitionerResponse } from "./models/BundlePractitionerResponse";
import { BundleSubmissionResponse } from "./models/BundleSubmissionResponse";
import { UploadClinicalDocumentResponse } from "./models/UploadClinicalDocumentResponse";

export class BundleSubmissionAPIHandler {


    private bundleSubmissionAPISettings!: BundleSubmissionAPI;
    private appSettings!: AppSettings;
    private token!: string

    constructor(appSettings: AppSettings, token: string) {
        this.appSettings = appSettings;
        this.bundleSubmissionAPISettings = appSettings.BundleSubmissionAPI;
        this.token = token;
    }

    async processBundleSubmissionRequestAsync(guid?: string): Promise<BundleSubmissionResponse | CommonFailedResponse> {
        const {
            ContentType,
            Accept,
            EndpointURL,
            HttpClientRequestTimeOutSeconds,
            Request
        } = this.bundleSubmissionAPISettings;

        const headers: Record<string, string> = {
            'Content-Type': ContentType,
            'Accept': Accept,
            'Authorization': `Bearer ${this.token}`,
        };


        const isNullOrEmpty = (s?: string) => !s || s.trim() === "";

        const id = isNullOrEmpty(Request.id) && isNullOrEmpty(guid)
            ? GuidGenerator.generate()
            : (!isNullOrEmpty(guid) ? guid : Request.id!);

        Request.id = id!;



        const { baseUrl, resourcePath } = URLUtils.parseUrl(EndpointURL);
        const timeoutMs = HttpClientRequestTimeOutSeconds * 1000;

        const httpClient = new HttpAxiosClient(baseUrl, headers, timeoutMs);

        const curlCommand = await httpClient.toCurl(resourcePath, 'POST', Request);
        logger.info(`Outgoing cURL: ${curlCommand}`);

        const response: ClientResponse = await httpClient.post(resourcePath, Request);

        const fileWriter: DataFileWriterUtils = new DataFileWriterUtils(this.appSettings.BaseFileLocationFolder);

        await fileWriter.writeJson('bundle-submission-nodejs', `request-${id}`, Request);

        await fileWriter.writeText('bundle-submission-nodejs', 'curl', curlCommand);

        if (!response?.success) {
            logger.error(`Failed processing Bundle Submission API Request Data!`);
            const failedResponse = HttpResponseUtils.getFailedResponseObject(response);
            if (failedResponse.response) {
                logger.error(`Response: ${failedResponse.response}`);
                await fileWriter.writeJson('bundle-submission-nodejs', `response-failed-${id}`, failedResponse.response!);
            }

            return failedResponse;
        }
        const fileNamePostFixString = response.response?.status === 200 ? 'response-success' : 'response-failed';
        const successReponse: BundleSubmissionResponse = response.response!.data as BundleSubmissionResponse;
        await fileWriter.writeJson('bundle-submission-nodejs', `${fileNamePostFixString}-${id}`, successReponse);
        return successReponse;
    }


    async prepareBundleSubmissionRequest(uploadClinicalDocumentSuccessResponse: UploadClinicalDocumentResponse, sharedGuidId: string): Promise<void> {

        const bundleRequest = this.bundleSubmissionAPISettings.Request;

        bundleRequest.id = sharedGuidId;

        const timestamp = DateTimeUtil.getCurrentWithOffset();
        bundleRequest.timestamp = timestamp;

        const fullFileNameWithPath = FileUtils.getFullFilePath({
            folder: this.appSettings.BaseFileLocationFolder!,
            fileName: uploadClinicalDocumentSuccessResponse.filename!
        });

        const resourceTypeDocumentReferenceGuid = GuidGenerator.generate();
        const resourceTypeListGuid = GuidGenerator.generate();

        bundleRequest.entry?.forEach(entry => {

            if (entry.resource) {
                const resource = entry.resource;
                resource.date = timestamp;

                // -------------------------------
                // DocumentReference branch
                // -------------------------------
                if (resource.resourceType === "DocumentReference") {
                    entry.fullUrl = RequestTransformerUtil.urnUuidFormattedValue(resourceTypeDocumentReferenceGuid);

                    const resourceDocumentReferece = resource as DocumentReference;

                    if (resourceDocumentReferece.content && resourceDocumentReferece.content.length > 0) {
                        resource.id = resourceTypeDocumentReferenceGuid;

                        const attachment = resourceDocumentReferece.content[0].attachment;
                        if (attachment) {
                            attachment.id = `${resourceTypeDocumentReferenceGuid}_document`;
                            attachment.title = `${resourceTypeDocumentReferenceGuid}_pkpadmin`;
                            attachment.url = uploadClinicalDocumentSuccessResponse.s3uri!;
                            attachment.contentType = "application/xml";
                            attachment.size = FileUtils.getFileSizeBytes(fullFileNameWithPath);
                            attachment.hash = CryptoUtils.computeSHA256Checksum(fullFileNameWithPath);
                            attachment.creation = DateTimeUtil.getCurrentUtc();
                        }
                    }

                    if (resourceDocumentReferece.identifier && resourceDocumentReferece.identifier.length > 0) {
                        resourceDocumentReferece.identifier.forEach(identifier => {
                            if (identifier.system?.includes("Esmd-Idn-UniqueId")) {
                                identifier.value = sharedGuidId;
                            }
                        });
                    }
                }

                // -------------------------------
                // List branch
                // -------------------------------
                else if (resource.resourceType === "List") {
                    const resourceList = resource as ListResource;
                    if (
                        resourceList.entry &&
                        resourceList.entry.length > 0) {
                        entry.fullUrl = RequestTransformerUtil.urnUuidFormattedValue(resourceTypeListGuid);
                        resource.id = resourceTypeListGuid;

                        const documentReferenceEntry = resourceList.entry[0];
                        if (documentReferenceEntry.item) {
                            documentReferenceEntry.item.reference =
                                RequestTransformerUtil.urnUuidFormattedValue(resourceTypeDocumentReferenceGuid);
                        }

                        resourceList.extension?.forEach(extension => {
                            if (extension.url?.includes("Esmd-Ext-UniqueId")) {
                                extension.valueString = sharedGuidId;
                            }
                        });
                    }
                }

            }
        });
    }



}