export interface PractitionerResponse {
    resourceType?: string
    id?: string
    identifier?: Identifier
    meta?: Meta
    name?: Name[]
    telecom?: Telecom[]
    address?: Address[]
    gender?: string
    active?: boolean
    extension?: Extension[]
    issue?: Issue[]
}

export interface Identifier {
    system?: string
    value?: string
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

export interface Name {
    family?: string
    given?: string[]
    prefix?: string[]
    suffix?: string[]
}

export interface Telecom {
    system?: string
    value?: string
    use?: string
}

export interface Address {
    use?: string
    line?: string[]
    city?: string
    state?: string
    postalCode?: string
}

export interface Extension {
    url?: string
    valueString?: string
    valueCode?: string
    valueDate?: string
}

export interface Issue {
    extension?: Extension2[]
    severity?: string
    code?: string
    details?: Details
    diagnostics?: string
    location: string[]
}

export interface Extension2 {
    url?: string
    valueInteger?: number
    valueString?: string
}

export interface Details {
    coding?: Coding[]
}

export interface Coding {
    system?: string
    code?: string
}
