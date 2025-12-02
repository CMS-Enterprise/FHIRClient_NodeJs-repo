import { RequestParameter } from "./NotificationRetrievalAPI";

export interface DocumentRetrievalAPI {
    EndpointURL: string;
    Accept: string;
    HttpClientRequestTimeOutSeconds: number;
    RequestParameters: RequestParameter[];
}
