
import { HttpAxiosClient } from "../src/common/client/HttpAxiosClient";
import { URLUtils } from "../src/common/utils/URLUtils";
import { GuidGenerator } from "../src/common/utils/GuidGenerator";
import { DataFileWriterUtils } from "../src/common/utils/DataFileWriterUtils";
import { HttpResponseUtils } from "../src/common/utils/HttpResponseUtils";
import { logger } from "../src/common/logger/Logger";
import { BinaryClientAPIHandler } from "../src/document-retrieval-api/BinaryClientAPIHandler";

jest.mock("../src/common/client/HttpAxiosClient");
jest.mock("../src/common/utils/URLUtils");
jest.mock("../src/common/utils/GuidGenerator");
jest.mock("../src/common/utils/DataFileWriterUtils");
jest.mock("../src/common/utils/HttpResponseUtils");
jest.mock("../src/common/logger/Logger");

describe("BinaryClientAPIHandler", () => {
    let handler: BinaryClientAPIHandler;
    let mockHttpClient: any;
    let mockFileWriter: any;

    const fakeGuid = "guid-12345";

    const mockAppSettings = {
        BaseFileLocationFolder: "/tmp",
        BinaryAPI: {
            Accept: "application/octet-stream",
            EndpointURL: "https://api.com/binary/{id}",
            HttpClientRequestTimeOutSeconds: 7,
            FileNameId: "default-binary-id"
        }
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();

        // GUID mocking
        (GuidGenerator.generate as jest.Mock).mockReturnValue(fakeGuid);

        // URL parsing
        (URLUtils.parseUrl as jest.Mock).mockReturnValue({
            baseUrl: "https://api.com",
            resourcePath: "/binary/123"
        });

        // Mock HttpAxiosClient instance
        mockHttpClient = {
            toCurl: jest.fn().mockResolvedValue("curl --binary"),
            get: jest.fn()
        };
        (HttpAxiosClient as jest.Mock).mockImplementation(() => mockHttpClient);

        // Mock FileWriter
        mockFileWriter = {
            writeText: jest.fn().mockResolvedValue(undefined),
            writeJson: jest.fn().mockResolvedValue(undefined)
        };
        (DataFileWriterUtils as jest.Mock).mockImplementation(() => mockFileWriter);

        handler = new BinaryClientAPIHandler(mockAppSettings, "token-abc");
    });

    // --------------------------------------------------------------------
    test("replaces {id} in EndpointURL using provided fileNameIDValue", async () => {
        mockHttpClient.get.mockResolvedValue({
            success: true,
            response: { status: 200, data: { file: "ok" } }
        });

        await handler.getBinaryFileDataAsync("custom-id");

        expect(URLUtils.parseUrl).toHaveBeenCalledWith("https://api.com/binary/custom-id");
    });

    // --------------------------------------------------------------------
    test("uses default FileNameId when no argument passed", async () => {
        mockHttpClient.get.mockResolvedValue({
            success: true,
            response: { status: 200, data: { ok: true } }
        });

        await handler.getBinaryFileDataAsync();

        expect(URLUtils.parseUrl).toHaveBeenCalledWith("https://api.com/binary/default-binary-id");
    });

    // --------------------------------------------------------------------
    test("constructs HttpAxiosClient with correct parameters", async () => {
        mockHttpClient.get.mockResolvedValue({
            success: true,
            response: { status: 200, data: {} }
        });

        await handler.getBinaryFileDataAsync("123");

        expect(HttpAxiosClient as jest.Mock).toHaveBeenCalledWith(
            "https://api.com",
            {
                Accept: "application/octet-stream",
                Authorization: "Bearer token-abc"
            },
            7000
        );
    });

    // --------------------------------------------------------------------
    test("logs and writes cURL command", async () => {
        mockHttpClient.get.mockResolvedValue({
            success: true,
            response: { status: 200, data: {} }
        });

        await handler.getBinaryFileDataAsync("123");

        expect(mockHttpClient.toCurl).toHaveBeenCalledWith("/binary/123", "GET");
        expect(mockFileWriter.writeText).toHaveBeenCalledWith(
            "binary-client-nodejs",
            "curl",
            "curl --binary"
        );
    });

    // --------------------------------------------------------------------
    test("returns success response when API returns status 200", async () => {
        const successResp = { file: "data" };

        mockHttpClient.get.mockResolvedValue({
            success: true,
            response: {
                status: 200,
                data: successResp
            }
        });

        const result = await handler.getBinaryFileDataAsync("123");

        expect(result).toEqual(successResp);

        expect(mockFileWriter.writeJson).toHaveBeenCalledWith(
            "binary-client-nodejs",
            `response-success-${fakeGuid}`,
            successResp
        );
    });

    // --------------------------------------------------------------------
    test("writes response-failed when status != 200 but success = true", async () => {
        const data = { error: "not allowed" };

        mockHttpClient.get.mockResolvedValue({
            success: true,
            response: { status: 403, data }
        });

        await handler.getBinaryFileDataAsync("123");

        expect(mockFileWriter.writeJson).toHaveBeenCalledWith(
            "binary-client-nodejs",
            `response-failed-${fakeGuid}`,
            data
        );
    });

    // --------------------------------------------------------------------
    test("handles failed API response and writes response-failed file", async () => {
        const failedRaw = { status: 500, data: { msg: "boom" } };
        const transformed = {
            error: "some-error",
            response: { transformedData: true }
        };

        mockHttpClient.get.mockResolvedValue({
            success: false,
            response: failedRaw
        });

        (HttpResponseUtils.getFailedResponseObject as jest.Mock).mockReturnValue(transformed);

        const result = await handler.getBinaryFileDataAsync("123");

        expect(logger.error).toHaveBeenCalledWith("Failed processing DeliveryConfirmation Data!");

        expect(mockFileWriter.writeJson).toHaveBeenCalledWith(
            "binary-client-nodejs",
            `response-failed-${fakeGuid}`,
            transformed.response
        );

        expect(result).toBe(transformed);
    });

    // --------------------------------------------------------------------
    test("does not crash when failed response has no .response", async () => {
        mockHttpClient.get.mockResolvedValue({
            success: false,
            response: null
        });

        (HttpResponseUtils.getFailedResponseObject as jest.Mock).mockReturnValue({
            error: "x"
        });

        const result = await handler.getBinaryFileDataAsync("999");

        expect(logger.error).toHaveBeenCalled();
        expect(mockFileWriter.writeJson).not.toHaveBeenCalled(); // no .response → no JSON write
        expect(result).toEqual({ error: "x" });
    });
});
