export interface NotificationResponse {
  resourceType?: string
  id?: string
  meta?: Meta
  type?: string
  link?: Link[]
  entry?: Entry[]
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
  contained?: Contained[]
  status?: string
  mode?: string
  title?: string
  date?: string
  extension?: Extension[]
  entry?: Entry2[]
}

export interface Meta2 {
  profile?: string[]
  security?: Security2[]
}

export interface Security2 {
  coding?: Coding2[]
}

export interface Coding2 {
  system?: string
  code?: string
  display?: string
}

export interface Contained {
  resourceType?: string
  id?: string
  issue?: Issue[]
}

export interface Issue {
  severity?: string
  code?: string
  details?: Details
  diagnostics?: string
}

export interface Details {
  coding?: Coding3[]
}

export interface Coding3 {
  system?: string
  code?: string
  display?: string
}

export interface Extension {
  url?: string
  valueString?: string
  valueCode?: string
  valueDateTime?: string
}

export interface Entry2 {
  item?: Item
}

export interface Item {
  reference?: string
}
