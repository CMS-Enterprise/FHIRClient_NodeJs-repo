import { OneOrMany } from "../../common/type/types";

export interface BundlePractitionerResponse {
    resourceType?: string
    id?: string
    meta?: Meta
    identifier?: OneOrMany<Identifier>;
    type?: string
    link?: Link[]
    entry?: Entry[]
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
    url?: string
    valueString?: string
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
