export interface DeliveryConfirmationResponse {
    resourceType?: string
    id?: string
    meta?: Meta
    contained?: Contained[]
    extension?: Extension[]
    status?: string
    mode?: string
    title?: string
    date?: string
    entry?: Entry[]
}

export interface Meta {
    versionId?: string
    lastUpdated?: string
    source?: string
    profile?: string[]
    security?: Security[]
}

export interface Security {
    system?: string
    code?: string
    display?: string
}

export interface Contained {
    resourceType?: string
    id?: string
    meta?: Meta2
    issue?: Issue[]
}

export interface Meta2 {
    profile?: string[]
}

export interface Issue {
    severity?: string
    code?: string
    diagnostics?: string
    details?: Details
}

export interface Details {
    coding?: Coding[]
}

export interface Coding {
    system?: string
    code?: string
    display?: string
}


export interface Extension {
    url?: string
    valueString?: string
    valueDateTime?: string
}

export interface Entry {
    item?: Item
}

export interface Item {
    reference?: string
}
