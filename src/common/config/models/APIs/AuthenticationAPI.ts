export interface AuthenticationAPI {
    ClientId: string;
    ClientSecret: string;
    Scope: string;
    EndpointURL: string;
    ContentType: string;
    HttpClientRequestTimeOutSeconds: number
}
