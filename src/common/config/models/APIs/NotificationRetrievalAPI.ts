export interface RequestParameter {
    name: string;
    value: string;
    inject: boolean;
}

export interface NotificationRetrievalAPI {
    EndpointURL: string;
    Accept: string;
    HttpClientRequestTimeOutSeconds: number;
    RequestParameters: RequestParameter[];
}
