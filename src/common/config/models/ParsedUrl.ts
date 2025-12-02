
export interface ParsedUrl {
    baseUrl: string;
    resourcePath: string;
    params?: Record<string, string>;
}
