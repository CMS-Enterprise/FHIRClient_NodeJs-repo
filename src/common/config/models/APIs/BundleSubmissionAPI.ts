export interface SecurityTag {
    system: string;
    code: string;
    display: string;
}

export interface BundleMeta {
    profile: string[];
    security: SecurityTag[];
}

export interface ListExtension {
    url: string;
    valueCode?: string;
    valueString?: string;
}

export interface ListEntryItem {
    item: {
        reference: string;
    };
}

export interface ListResource {
    resourceType: string;
    id: string;
    meta: BundleMeta;
    extension: ListExtension[];
    status: string;
    mode: string;
    title: string;
    date: string;
    entry: ListEntryItem[];
}

export interface DocumentReferenceIdentifier {
    system: string;
    value: string;
}

export interface DocumentReferenceAttachment {
    id: string;
    contentType: string;
    url: string;
    size: number;
    hash: string;
    title: string;
    creation: string;
}

export interface DocumentReferenceFormat {
    system: string;
    code: string;
}

export interface DocumentReferenceContent {
    attachment: DocumentReferenceAttachment;
    format: DocumentReferenceFormat;
}

export interface FacilityTypeCode {
    system: string;
    code: string;
    display: string;
}

export interface DocumentReferenceContext {
    facilityType: {
        coding: FacilityTypeCode[];
    };
}

export interface DocumentReference {
    resourceType: string;
    id: string;
    meta: BundleMeta;
    identifier: DocumentReferenceIdentifier[];
    status: string;
    date: string;
    category: any[];
    securityLabel: any[];
    content: DocumentReferenceContent[];
    context: DocumentReferenceContext;
}

export interface BundleEntry {
    fullUrl: string;
    resource: ListResource | DocumentReference;
    request: {
        method: string;
        url: string;
    };
}

export interface BundleSubmissionRequest {
    resourceType: string;
    id: string;
    meta: BundleMeta;
    type: string;
    timestamp: string;
    entry: BundleEntry[];
}

export interface BundleSubmissionAPI {
    EndpointURL: string;
    ContentType: string;
    Accept: string;
    HttpClientRequestTimeOutSeconds: number;
    Request: BundleSubmissionRequest;
}
