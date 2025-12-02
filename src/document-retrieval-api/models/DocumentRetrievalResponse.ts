export interface DocumentRetrievalResponse {
    resourceType?: string
    id?: string
    meta?: Meta
    type?: string
    total?: number
    link?: Link[]
    entry?: Entry[]
    issue?: Issue[]
}


export interface Issue {
    severity?: string
    code?: string
    details?: Details
}

export interface Details {
    coding?: Coding[]
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

export interface Link {
    relation?: string
    url?: string
}

export interface Entry {
    fullUrl?: string
    resource?: Resource
}

export interface Resource {
    resourceType?: string
    id?: string
    meta?: Meta2
    extension?: Extension[]
    identifier?: Identifier[]
    status?: string
    date?: string
    securityLabel?: SecurityLabel[]
    content?: Content[]
    context?: Context
}

export interface Meta2 {
    profile?: string[]
}

export interface Extension {
    url?: string
    valueString?: string
    valueCode?: string
}

export interface Identifier {
    system?: string
    value?: string
}

export interface SecurityLabel {
    coding?: Coding[]
}

export interface Coding {
    system?: string
    code?: string
    display?: string
}

export interface Content {
    attachment?: Attachment
    format?: Format
}

export interface Attachment {
    id?: string
    contentType?: string
    language?: string
    url?: string
    size?: number
    hash?: string
    title?: string
    creation?: string
}

export interface Format {
    system?: string
    code?: string
    display?: string
}

export interface Context {
    facilityType?: FacilityType
}

export interface FacilityType {
    coding?: Coding2[]
}

export interface Coding2 {
    system?: string
    code?: string
    display?: string
}
