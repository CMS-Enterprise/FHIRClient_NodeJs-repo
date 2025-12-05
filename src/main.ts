
import * as dotenv from 'dotenv';
import { logger } from './common/logger/Logger';
import { AppSettingsLoader } from './common/config/AppSettingsLoader';
import { AppSettings } from './common/config/models/AppSettings';
import { Token } from './authentication-api/models/Token';
import { CommonFailedResponse } from './common/models/CommonFailedResponse';
import { AuthenticationAPIHandler } from './authentication-api/AuthenticationAPIHandler';
import { DeliveryConfirmationResponse } from './document-retrieval-api/models/DeliveryConfirmationResponse';
import { DeliveryConfirmationAPIHandler } from './document-retrieval-api/DeliveryConfirmationAPIHandler';
import { GuidGenerator } from './common/utils/GuidGenerator';
import { NotificationResponse } from './notification-retrieval-api/models/NotificationResponse';
import { NotificationAPIHander } from './notification-retrieval-api/NotificationAPIHander';
import { PractitionerResponse } from './practitioner-api/models/PractitionerResponse';
import { PractitionerAPIHandler } from './practitioner-api/PractitionerAPIHandler';
import { BinaryClientResponse } from './document-retrieval-api/models/BinaryClientResponse';
import { BinaryClientAPIHandler } from './document-retrieval-api/BinaryClientAPIHandler';
import { DocumentRetrievalResponse } from './document-retrieval-api/models/DocumentRetrievalResponse';
import { DocumentRetrievalAPIHandler } from './document-retrieval-api/DocumentRetrievalAPIHandler';
import { BundlePractitionerResponse } from './bundle-submission-api/models/BundlePractitionerResponse';
import { BundlePractitionerAPIHandler } from './bundle-submission-api/BundlePractitionerAPIHandler';
import { PresignedURLAPIHandler } from './bundle-submission-api/PresignedURLAPIHandler';
import { PresignedURLResponse } from './bundle-submission-api/models/PresignedURLResponse';
import { ClnicalDocumentUploadAPIHandler } from './bundle-submission-api/ClnicalDocumentUploadAPIHandler';
import { PresignedURLInfo } from './bundle-submission-api/models/PresignedURLInfo';
import { UploadClinicalDocumentResponse } from './bundle-submission-api/models/UploadClinicalDocumentResponse';
import { BundleSubmissionResponse } from './bundle-submission-api/models/BundleSubmissionResponse';
import { BundleSubmissionAPIHandler } from './bundle-submission-api/BundleSubmissionAPIHandler';

// Load environment variables
dotenv.config();

async function getSettings(): Promise<AppSettings> {
    return AppSettingsLoader.load();
}

async function init() {
    logger.info('Main Started ..... Processing FHIR Client Requests!');
}

async function finilize() {
    logger.info('Main Ended ..... Processing FHIR Client Requests!');
}

async function getToken(appSettings: AppSettings): Promise<Token | CommonFailedResponse> {

    const token = new AuthenticationAPIHandler(appSettings = appSettings);
    return await token.getToken();
}

async function processDeliveryConfirmationAsync(appSettings: AppSettings, token: string): Promise<DeliveryConfirmationResponse | CommonFailedResponse> {

    appSettings.DeliveryConfirmationAPI.Request.id = GuidGenerator.generate();
    const deliveryConfirmtionHandler = new DeliveryConfirmationAPIHandler(appSettings = appSettings, token = token);
    return await deliveryConfirmtionHandler.processDeliveryConfirmationAsync();

}

async function processPractitionerRequestAsync(appSettings: AppSettings, token: string, practitionerId?: string): Promise<PractitionerResponse | CommonFailedResponse> {


    const practitionerHandler = new PractitionerAPIHandler(appSettings = appSettings, token = token);
    return await practitionerHandler.processPractitionerRequestAsync(practitionerId);

}


async function getNotificationsAsync(appSettings: AppSettings, token: string): Promise<NotificationResponse | CommonFailedResponse> {

    appSettings.DeliveryConfirmationAPI.Request.id = GuidGenerator.generate();
    const notificationHandler = new NotificationAPIHander(appSettings = appSettings, token = token);
    return await notificationHandler.getNotificationsAsync();

}


async function getDocumentRetrievalDataAsync(appSettings: AppSettings, token: string): Promise<DocumentRetrievalResponse | CommonFailedResponse> {

    const documentRetrievalHandler = new DocumentRetrievalAPIHandler(appSettings = appSettings, token = token);
    return await documentRetrievalHandler.getDocumentRetrievalDataAsync();

}


async function getBinaryFileDataAsync(appSettings: AppSettings, token: string, fileNameIDValue?: string): Promise<BinaryClientResponse | CommonFailedResponse> {

    const binaryHandler = new BinaryClientAPIHandler(appSettings = appSettings, token = token);
    return await binaryHandler.getBinaryFileDataAsync(fileNameIDValue);

}

async function processBundlePractitionerRequestAsync(appSettings: AppSettings, token: string, guid?: string): Promise<BundlePractitionerResponse | CommonFailedResponse> {


    const bundlePractitionerHandler = new BundlePractitionerAPIHandler(appSettings = appSettings, token = token);
    return await bundlePractitionerHandler.processBundlePractitionerRequestAsync(guid);

}

async function getPresignedURLAsync(appSettings: AppSettings, token: string, guid: string): Promise<PresignedURLInfo[]> {


    const presignedURLHandler = new PresignedURLAPIHandler(appSettings = appSettings, token = token);
    const response = await presignedURLHandler.getPresignedURLAsync(guid) as PresignedURLResponse;
    return await presignedURLHandler.processPresignedURLResponse(response);

}

async function uploadClinicalDocumentAsync(appSettings: AppSettings, token: string, presignedURL: string, fileName: string): Promise<UploadClinicalDocumentResponse | CommonFailedResponse> {


    const clinicalDocumentUploadHandler = new ClnicalDocumentUploadAPIHandler(appSettings = appSettings, token = token);
    return await clinicalDocumentUploadHandler.uploadClinicalDocumentAsync(presignedURL, fileName);

}

async function processBundleSubmissionRequestAsync(appSettings: AppSettings, token: string, uploadClinicalDocumentSuccessResponse: UploadClinicalDocumentResponse, guid: string): Promise<BundleSubmissionResponse | CommonFailedResponse> {


    const bundleSubmissionHandler = new BundleSubmissionAPIHandler(appSettings = appSettings, token = token);
    await bundleSubmissionHandler.prepareBundleSubmissionRequest(uploadClinicalDocumentSuccessResponse, guid);
    return await bundleSubmissionHandler.processBundleSubmissionRequestAsync(guid);

}



async function main() {

    await init();
    logger.info(`Client ID: ${process.env.CLIENT_ID} and Client Secret:  ${process.env.CLIENT_SECRET}`);
    const settings = await getSettings();
    logger.info(`Base FHIR Server URL: ${settings.FHIRServerUrl}`);
    logger.info(`Authentication Endpoint:${settings.AuthenticationAPI.EndpointURL}`);

    const sharedGuidId = GuidGenerator.generate();
    logger.info(`Shared GUID ID ${sharedGuidId}`);


    if (process.env.CLIENT_SECRET && process.env.CLIENT_ID) {

        settings.AuthenticationAPI.ClientId = process.env.CLIENT_ID;
        settings.AuthenticationAPI.ClientSecret = process.env.CLIENT_SECRET

        const tokenResult = await getToken(settings);
        logger.info(`Token: ${JSON.stringify(tokenResult)}`);

        if (tokenResult && 'access_token' in tokenResult) {

            const tokenValue = tokenResult.access_token;
            logger.info(`Token Value: ${tokenValue}`);

            logger.info('Processing Presigned URL Processing Request!')
            const presignedURLDataList = await getPresignedURLAsync(settings, tokenValue, sharedGuidId);

            if (presignedURLDataList && presignedURLDataList.length > 0) {
                for (const presignedURL of presignedURLDataList) {

                    if (presignedURL.partValueUrl?.valueUrl && presignedURL.partValueString?.valueString) {
                        logger.info(`Processing Clinical Documnent Upload with Presigned URL ${presignedURL.partValueUrl.valueUrl} Processing Request!`)
                        const uploadClinicalDocumentResponse = await uploadClinicalDocumentAsync(settings, tokenValue, presignedURL.partValueUrl.valueUrl,
                            presignedURL.partValueString.valueString
                        );
                        logger.info('Processing Bundle Submission Request!')
                        const bundleSubmissionResponse = await processBundleSubmissionRequestAsync(settings, tokenValue, uploadClinicalDocumentResponse as UploadClinicalDocumentResponse,
                            sharedGuidId);

                    }


                }
            }


            logger.info('Processing Delivery Confirmation!')
            const deliveryConfirmationResponse = await processDeliveryConfirmationAsync(settings, tokenValue);

            logger.info('Processing Notification Retrievals!')
            const notificationRetrievalResponse = await getNotificationsAsync(settings, tokenValue);

            logger.info('Processing Practitioner Request!')
            const practitionerResponse = await processPractitionerRequestAsync(settings, tokenValue);

            logger.info('Processing Binary Client data!')
            const binaryClientResponse = await getBinaryFileDataAsync(settings, tokenValue);

            logger.info('Processing Document Retrieval data!')
            const documentRetrievalClientResponse = await getDocumentRetrievalDataAsync(settings, tokenValue);

            logger.info('Processing Bundle Practitioner Request!')
            const bundlePractitionerResponse = await processBundlePractitionerRequestAsync(settings, tokenValue, sharedGuidId);




        }
        else {
            logger.warn(`Failed to receive/generate token!`);
        }

    }


    await finilize();

}

main();