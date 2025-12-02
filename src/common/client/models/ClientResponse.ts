import { AxiosResponse } from "axios";

export interface ClientResponse{

    response?: AxiosResponse | null,
    success: boolean,
    error?: any

}

export interface ClientResponseTest{

    response?: any,
    success: boolean,
    error?: any

}