
import { HttpAxiosClient } from "../src/common/client/HttpAxiosClient";
import { URLUtils } from "../src/common/utils/URLUtils";
import { GuidGenerator } from "../src/common/utils/GuidGenerator";
import { DataFileWriterUtils } from "../src/common/utils/DataFileWriterUtils";
import { HttpResponseUtils } from "../src/common/utils/HttpResponseUtils";
import { logger } from "../src/common/logger/Logger";
import { DeliveryConfirmationAPIHandler } from "../src/document-retrieval-api/DeliveryConfirmationAPIHandler";

jest.mock("../src/common/client/HttpAxiosClient");
jest.mock("../src/common/utils/URLUtils");
jest.mock("../src/common/utils/GuidGenerator");
jest.mock("../src/common/utils/DataFileWriterUtils");
jest.mock("../src/common/utils/HttpResponseUtils");
jest.mock("../src/common/logger/Logger");

describe("DeliveryConfirmationAPIHandler", () => {
    let handler: DeliveryConfirmationAPIHandler;
    let mockHttpClient: any;
    let mockFileWriter: any;

    const fakeGuid = "guid-98765";

    const mockAppSettings = {
        BaseFileLocationFolder: "/var/x",
        DeliveryConfirmationAPI: {
            ContentType: "application/json",
            Accept: "application/fhir+json",
            EndpointURL: "https://api.com/delivery",
            HttpClientRequestTimeOutSeconds: 9,
            Request: { test: "payload" }
        }
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock GUID
        (GuidGenerator.generate as jest.Mock).mockReturnValue(fakeGuid);

        // Mock URL parsing
        (URLUtils.parseUrl as jest.Mock).mockReturnValue({
            baseUrl: "https://api.com",
            resourcePath: "/delivery"
        });

        // Mock HttpAxiosClient instance
        mockHttpClient = {
            toCurl: jest.fn().mockResolvedValue("curl-delivery"),
            post: jest.fn()
        };
        (HttpAxiosClient as jest.Mock).mockImplementation(() => mockHttpClient);

        // Mock FileWriter
        mockFileWriter = {
            writeJson: jest.fn().mockResolvedValue(undefined),
            writeText: jest.fn().mockResolvedValue(undefined)
        };
        (DataFileWriterUtils as jest.Mock).mockImplementation(() => mockFileWriter);

        handler = new DeliveryConfirmationAPIHandler(mockAppSettings, "token-123");
    });

    // ----------------------------------------------------------------------
    test("constructs HttpAxiosClient with correct arguments", async () => {
        mockHttpClient.post.mockResolvedValue({
            success: true,
            response: { status: 200, data: {} }
        });

        await handler.processDeliveryConfirmationAsync();

        expect(HttpAxiosClient as jest.Mock).toHaveBeenCalledWith(
            "https://api.com",
            {
                "Content-Type": "application/json",
                "Accept": "application/fhir+json",
                "Authorization": "Bearer token-123"
            },
            9000
        );
    });

    // ----------------------------------------------------------------------
    test("generates and logs cURL command", async () => {
        mockHttpClient.post.mockResolvedValue({
            success: true,
            response: { status: 200, data: {} }
        });

        await handler.processDeliveryConfirmationAsync();

        expect(mockHttpClient.toCurl).toHaveBeenCalledWith(
            "/delivery",
            "POST",
            mockAppSettings.DeliveryConfirmationAPI.Request
        );

        expect(mockFileWriter.writeText).toHaveBeenCalledWith(
            "delivery-confirmation-nodejs",
            "curl",
            "curl-delivery"
        );
    });

    // ----------------------------------------------------------------------
    test("writes request JSON before API response", async () => {
        mockHttpClient.post.mockResolvedValue({
            success: true,
            response: { status: 200, data: {} }
        });

        await handler.processDeliveryConfirmationAsync();

        expect(mockFileWriter.writeJson).toHaveBeenCalledWith(
            "delivery-confirmation-nodejs",
            `request-${fakeGuid}`,
            mockAppSettings.DeliveryConfirmationAPI.Request
        );
    });

    // ----------------------------------------------------------------------
    test("returns success response when API returns status 200", async () => {
        const successData = { confirmation: "ok" };

        mockHttpClient.post.mockResolvedValue({
            success: true,
            response: { status: 200, data: successData }
        });

        const result = await handler.processDeliveryConfirmationAsync();

        expect(result).toEqual(successData);

        expect(mockFileWriter.writeJson).toHaveBeenCalledWith(
            "delivery-confirmation-nodejs",
            `response-success-${fakeGuid}`,
            successData
        );
    });

    // ----------------------------------------------------------------------
    test("writes response-failed JSON when API returns non-200 success", async () => {
        const failureData = { message: "unprocessable" };

        mockHttpClient.post.mockResolvedValue({
            success: true,
            response: { status: 422, data: failureData }
        });

        await handler.processDeliveryConfirmationAsync();

        expect(mockFileWriter.writeJson).toHaveBeenCalledWith(
            "delivery-confirmation-nodejs",
            `response-failed-${fakeGuid}`,
            failureData
        );
    });

    // ----------------------------------------------------------------------
    test("handles success=false responses and logs errors", async () => {
        const rawResponse = { status: 500, data: { err: "broken" } };
        const failedObj = {
            error: "converted",
            response: { converted: true }
        };

        mockHttpClient.post.mockResolvedValue({
            success: false,
            response: rawResponse
        });

        (HttpResponseUtils.getFailedResponseObject as jest.Mock).mockReturnValue(failedObj);

        const result = await handler.processDeliveryConfirmationAsync();

        expect(logger.error).toHaveBeenCalledWith("Failed processing DeliveryConfirmation Data!");

        expect(mockFileWriter.writeJson).toHaveBeenCalledWith(
            "delivery-confirmation-nodejs",
            `response-failed-${fakeGuid}`,
            failedObj.response
        );

        expect(result).toBe(failedObj);
    });

    // ----------------------------------------------------------------------
    test("does not write failed response JSON when failedResponse.response is missing", async () => {
        mockHttpClient.post.mockResolvedValue({
            success: false,
            response: null
        });

        (HttpResponseUtils.getFailedResponseObject as jest.Mock).mockReturnValue({
            error: "oops"
        });

        const result = await handler.processDeliveryConfirmationAsync();

        expect(mockFileWriter.writeJson).toHaveBeenCalledTimes(1); // only the request JSON  
        expect(result).toEqual({ error: "oops" });
    });
});
