
import { HttpAxiosClient } from "../src/common/client/HttpAxiosClient";
import { URLUtils } from "../src/common/utils/URLUtils";
import { GuidGenerator } from "../src/common/utils/GuidGenerator";
import { DataFileWriterUtils } from "../src/common/utils/DataFileWriterUtils";
import { HttpResponseUtils } from "../src/common/utils/HttpResponseUtils";
import { logger } from "../src/common/logger/Logger";
import { DocumentRetrievalAPIHandler } from "../src/document-retrieval-api/DocumentRetrievalAPIHandler";

jest.mock("../src/common/client/HttpAxiosClient");
jest.mock("../src/common/utils/URLUtils");
jest.mock("../src/common/utils/GuidGenerator");
jest.mock("../src/common/utils/DataFileWriterUtils");
jest.mock("../src/common/utils/HttpResponseUtils");
jest.mock("../src/common/logger/Logger");

describe("DocumentRetrievalAPIHandler", () => {
    let handler: DocumentRetrievalAPIHandler;
    let mockHttpClient: any;
    let mockFileWriter: any;

    const fakeGuid = "guid-55555";

    const mockAppSettings = {
        BaseFileLocationFolder: "/abc",
        DocumentRetrievalAPI: {
            Accept: "application/fhir+json",
            EndpointURL: "https://api.com/documents",
            HttpClientRequestTimeOutSeconds: 8,
            RequestParameters: [
                { name: "id", value: "123", inject: true },
                { name: "type", value: "summary", inject: true },
                { name: "shouldNotAppear", value: "xyz", inject: false }
            ]
        }
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();

        (GuidGenerator.generate as jest.Mock).mockReturnValue(fakeGuid);

        (URLUtils.parseUrl as jest.Mock).mockReturnValue({
            baseUrl: "https://api.com",
            resourcePath: "/documents"
        });

        mockHttpClient = {
            toCurl: jest.fn().mockResolvedValue("curl-docs"),
            get: jest.fn()
        };
        (HttpAxiosClient as jest.Mock).mockImplementation(() => mockHttpClient);

        mockFileWriter = {
            writeText: jest.fn().mockResolvedValue(undefined),
            writeJson: jest.fn().mockResolvedValue(undefined)
        };
        (DataFileWriterUtils as jest.Mock).mockImplementation(() => mockFileWriter);

        handler = new DocumentRetrievalAPIHandler(mockAppSettings, "token-xyz");
    });

    // -------------------------------------------------------------------
    test("extracts query parameters only where inject=true", async () => {
        mockHttpClient.get.mockResolvedValue({
            success: true,
            response: { status: 200, data: {} }
        });

        await handler.getDocumentRetrievalDataAsync();

        // resource path with query is passed to toCurl()
        expect(mockHttpClient.toCurl).toHaveBeenCalledWith(
            "/documents?id=123&type=summary",
            "GET"
        );
    });

    // -------------------------------------------------------------------
    test("constructs HttpAxiosClient correctly", async () => {
        mockHttpClient.get.mockResolvedValue({
            success: true,
            response: { status: 200, data: {} }
        });

        await handler.getDocumentRetrievalDataAsync();

        expect(HttpAxiosClient as jest.Mock).toHaveBeenCalledWith(
            "https://api.com",
            {
                Accept: "application/fhir+json",
                Authorization: "Bearer token-xyz"
            },
            8000
        );
    });

    // -------------------------------------------------------------------
    test("writes cURL command to file", async () => {
        mockHttpClient.get.mockResolvedValue({
            success: true,
            response: { status: 200, data: {} }
        });

        await handler.getDocumentRetrievalDataAsync();

        expect(mockFileWriter.writeText).toHaveBeenCalledWith(
            "document-retrieval-nodejs",
            "curl",
            "curl-docs"
        );
    });

    // -------------------------------------------------------------------
    test("returns success response when API returns 200", async () => {
        const data = { ok: true };

        mockHttpClient.get.mockResolvedValue({
            success: true,
            response: { status: 200, data }
        });

        const result = await handler.getDocumentRetrievalDataAsync();

        expect(result).toEqual(data);

        expect(mockFileWriter.writeJson).toHaveBeenCalledWith(
            "document-retrieval-nodejs",
            `response-success-${fakeGuid}`,
            data
        );
    });

    // -------------------------------------------------------------------
    test("writes response-failed JSON when API returns non-200 success", async () => {
        const data = { problem: true };

        mockHttpClient.get.mockResolvedValue({
            success: true,
            response: { status: 404, data }
        });

        await handler.getDocumentRetrievalDataAsync();

        expect(mockFileWriter.writeJson).toHaveBeenCalledWith(
            "document-retrieval-nodejs",
            `response-failed-${fakeGuid}`,
            data
        );
    });

    // -------------------------------------------------------------------
    test("handles success=false response and writes failed JSON", async () => {
        const raw = { status: 500, data: { err: "boom" } };
        const failedTransformed = {
            error: "converted-error",
            response: { transformed: true }
        };

        mockHttpClient.get.mockResolvedValue({
            success: false,
            response: raw
        });

        (HttpResponseUtils.getFailedResponseObject as jest.Mock).mockReturnValue(failedTransformed);

        const result = await handler.getDocumentRetrievalDataAsync();

        expect(logger.error).toHaveBeenCalledWith(
            "Failed processing document Retrieval Data!"
        );

        expect(mockFileWriter.writeJson).toHaveBeenCalledWith(
            "document-retrieval-nodejs",
            `response-failed-${fakeGuid}`,
            failedTransformed.response
        );

        expect(result).toEqual(failedTransformed);
    });

    // -------------------------------------------------------------------
    test("does not write JSON file when failedResponse.response is missing", async () => {
        mockHttpClient.get.mockResolvedValue({
            success: false,
            response: null
        });

        (HttpResponseUtils.getFailedResponseObject as jest.Mock).mockReturnValue({
            error: "no-body"
        });

        const result = await handler.getDocumentRetrievalDataAsync();

        expect(mockFileWriter.writeJson).toHaveBeenCalledTimes(0); // only curl written
        expect(result).toEqual({ error: "no-body" });
    });
});
