export interface PresignedURLResponse {
    resourceType?: string
    id?: string
    parameter?: Parameter[]
    meta?: Meta
    issue?: Issue[]
}

export interface Meta {
    profile?: string[]
}

export interface Issue {
    severity?: string
    code?: string
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

export interface Parameter {
    name?: string
    part?: Part[]
    valueDuration?: ValueDuration
}

export interface Part {
    name?: string
    part?: Part2[]
    valueString?: string
    valueUrl?: string
}

export interface Part2 {
    name?: string
    valueString?: string
    valueUrl?: string
}

export interface ValueDuration {
    value?: number
    unit?: string
    system?: string
    code?: string
}
