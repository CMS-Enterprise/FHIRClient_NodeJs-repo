export interface BundleSubmissionResponse {
    resourceType?: string
    id?: string
    meta?: Meta
    identifier?: Identifier
    type?: string
    link?: Link[]
    entry?: Entry[]
    extension?: Extension[]
    issue?: Issue[]
}


export interface Extension {
    url?: string
    valueString?: string
}

export interface Meta {
    profile?: string[]
    security?: Security[]
}

export interface Security {
    system?: string
    code?: string
    display?: string
}

export interface Identifier {
    system?: string
    value?: string
}

export interface Link {
    relation?: string
    url?: string
}

export interface Entry {
    response?: Response
}

export interface Response {
    status?: string
    location?: string
    etag?: string
    lastModified?: string
    outcome?: Outcome
}

export interface Outcome {
    resourceType?: string
    issue?: Issue[]
}

export interface Issue {
    severity?: string
    code?: string
    details?: Details
    diagnostics?: string
}

export interface Details {
    coding?: Coding[]
}

export interface Coding {
    system?: string
    code?: string
    display?: string
}
