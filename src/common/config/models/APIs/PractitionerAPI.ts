import { BundleMeta } from "./BundleSubmissionAPI";

export interface HumanName {
    family: string;
    given: string[];
    prefix: string[];
    suffix?: string[];
}

export interface Telecom {
    system: string;
    value: string;
    use: string;
}

export interface Address {
    use: string;
    line: string[];
    city: string;
    state: string;
    postalCode: string;
}

export interface PractitionerExtension {
    url: string;
    valueString?: string;
    valueCode?: string;
    valueDate?: string;
}

export interface PractitionerRequest {
    resourceType: string;
    id: string;
    meta: BundleMeta;
    name: HumanName[];
    telecom: Telecom[];
    address: Address[];
    gender: string;
    active: boolean;
    extension: PractitionerExtension[];
}

export interface PractitionerAPI {
    EndpointURL: string;
    Accept: string;
    ContentType: string;
    HttpClientRequestTimeOutSeconds: number;
    Request: PractitionerRequest;
}
