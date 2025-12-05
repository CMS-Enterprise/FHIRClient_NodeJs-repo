import { BundleMeta } from "./BundleSubmissionAPI";

export interface OperationOutcomeIssue {
    severity: string;
    code: string;
    diagnostics: string;
}

export interface OperationOutcome {
    resourceType: string;
    id: string;
    meta: BundleMeta;
    issue: OperationOutcomeIssue[];
}

export interface DeliveryConfirmationExtension {
    url: string;
    valueString?: string;
    valueDateTime?: string;
}

export interface DeliveryConfirmationEntryItem {
    item: {
        reference: string;
    };
}

export interface DeliveryConfirmationRequest {
    resourceType: string;
    id: string;
    meta: {
        profile: string[];
    };
    contained: OperationOutcome[];
    extension: DeliveryConfirmationExtension[];
    status: string;
    mode: string;
    title: string;
    date: string;
    entry: DeliveryConfirmationEntryItem[];
}

export interface DeliveryConfirmationAPI {
    EndpointURL: string;
    Accept: string;
    ContentType: string;
    HttpClientRequestTimeOutSeconds: number;
    Request: DeliveryConfirmationRequest;
}
