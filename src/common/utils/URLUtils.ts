import { ParsedUrl } from "../config/models/ParsedUrl";

export class URLUtils {

    static parseUrl(fullUrl: string): ParsedUrl {
        const url = new URL(fullUrl);

        const baseUrl = `${url.protocol}//${url.host}`;
        const resourcePath = url.pathname;

        const params: Record<string, string> = {};

        url.searchParams.forEach((value, key) => {
            params[key] = value;
        });

        return { baseUrl, resourcePath, params };
    }

    static getQueryParams(url: string): Record<string, string> {
        const result: Record<string, string> = {};
        const parsedUrl = new URL(url);

        parsedUrl.searchParams.forEach((value, key) => {
            result[key] = value;
        });

        return result;
    }

    static paramsToQueryString(params?: Record<string, string>): string {
        if (!params || Object.keys(params).length === 0) {
            return "";
        }

        const queryString = new URLSearchParams(params).toString();
        return `?${queryString}`;
    }

}
