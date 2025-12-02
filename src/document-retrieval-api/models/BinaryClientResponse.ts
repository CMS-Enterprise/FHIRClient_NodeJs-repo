export interface BinaryClientResponse {
  resourceType?: string
  id?: string
  meta?: Meta
  issue?: Issue[]
  contentType?: string
  data?: string
}

export interface Meta {
  profile?: string[]
  security?: Security[]
}

export interface Security {
  coding?: Coding[]
}

export interface Coding {
  system?: string
  code?: string
  display?: string
}

export interface Issue {
  severity?: string
  code?: string
  details?: Details
}

export interface Details {
  coding?: Coding[]
}

