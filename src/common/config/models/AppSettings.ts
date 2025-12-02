import { AuthenticationAPI } from './APIs/AuthenticationAPI';
import { PresignedURLAPI } from './APIs/PresignedURLAPI';
import { UploadClinicalDocumentAPI } from './APIs/UploadClinicalDocumentAPI';
import { BundleSubmissionAPI } from './APIs/BundleSubmissionAPI';
import { NotificationRetrievalAPI } from './APIs/NotificationRetrievalAPI';
import { DocumentRetrievalAPI } from './APIs/DocumentRetrievalAPI';
import { DeliveryConfirmationAPI } from './APIs/DeliveryConfirmationAPI';
import { PractitionerAPI } from './APIs/PractitionerAPI';
import { BinaryAPI } from './APIs/BinaryAPI';
import { BundlePractitionerAPI } from './APIs/BundlePractitionerAPI';

export interface AppSettings {
    HttpClientRequestTimeOutSeconds: number;
    BaseFileLocationFolder: string;
    FHIRServerUrl: string;
    EndPointBaseUrl: string;
    AuthenticationAPI: AuthenticationAPI;
    PresignedURLAPI: PresignedURLAPI;
    UploadClinicalDocumentAPI: UploadClinicalDocumentAPI;
    BundleSubmissionAPI: BundleSubmissionAPI;
    NotificationRetrievalAPI: NotificationRetrievalAPI;
    DocumentRetrievalAPI: DocumentRetrievalAPI;
    DeliveryConfirmationAPI: DeliveryConfirmationAPI;
    PractitionerAPI: PractitionerAPI;
    BinaryAPI: BinaryAPI;
    BundlePractitionerAPI: BundlePractitionerAPI;
}
