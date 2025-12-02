import { ClientResponse } from "../client/models/ClientResponse";
import { CommonFailedResponse } from "../models/CommonFailedResponse";

export class HttpResponseUtils {

    static getFailedResponseObject(httpClientResponse: ClientResponse): CommonFailedResponse {

        return {
            error: httpClientResponse.error,
            status_code: httpClientResponse.error?.code,
            status: httpClientResponse.error?.response?.status,
            status_description: httpClientResponse.error?.message,
            message: httpClientResponse.error?.message,
            response: JSON.stringify(httpClientResponse.error?.response?.data)

        };
    }
}