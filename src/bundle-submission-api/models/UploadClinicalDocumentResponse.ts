export interface UploadClinicalDocumentResponse {
    status?: string
    message?: string
    filename?: string
    s3uri?: string
    Error?: Error
}

export interface Error {
    Code?: string
    Message?: string
    "X-Amz-Expires"?: string
    Expires?: string
    ServerTime?: string
    RequestId?: string
    HostId?: string
}
