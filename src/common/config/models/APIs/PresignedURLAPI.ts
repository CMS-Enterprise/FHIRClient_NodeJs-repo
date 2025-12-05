export interface ParameterPart {
    name: string;
    valueString: string;
}

export interface PresignedURLParameter {
    name: string;
    part?: ParameterPart[];
    valueString?: string;
}

export interface PresignedURLRequest {
    resourceType: string;
    id: string;
    parameter: PresignedURLParameter[];
}

export interface PresignedURLAPI {
    EndpointURL: string;
    ContentType: string;
    Accept: string;
    HttpClientRequestTimeOutSeconds: number;
    Request: PresignedURLRequest;
}
