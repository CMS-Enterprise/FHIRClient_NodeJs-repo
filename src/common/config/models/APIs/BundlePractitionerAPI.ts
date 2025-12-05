import { BundleSubmissionRequest } from "./BundleSubmissionAPI";

export interface BundlePractitionerAPI {
    EndpointURL: string;
    ContentType: string;
    Accept: string;
    HttpClientRequestTimeOutSeconds: number;
    Request: BundleSubmissionRequest; // Reuse from BundleSubmissionAPI
}
