import { AxiosError } from "axios";

export interface CommonFailedResponse {
    error?: any,
    status? : number
    status_code?: any,
    status_description?: string,
    message?: string,
    response?: any,
    
}
