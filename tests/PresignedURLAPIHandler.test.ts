
import { HttpAxiosClient } from "../src/common/client/HttpAxiosClient";
import { URLUtils } from "../src/common/utils/URLUtils";
import { HttpResponseUtils } from "../src/common/utils/HttpResponseUtils";
import { DataFileWriterUtils } from "../src/common/utils/DataFileWriterUtils";
import { GuidGenerator } from "../src/common/utils/GuidGenerator";
import { logger } from "../src/common/logger/Logger";
import { FileUtils } from "../src/common/utils/FileUtils";
import { CryptoUtils } from "../src/common/utils/CryptoUtils";
import { PresignedURLAPIHandler } from "../src/bundle-submission-api/PresignedURLAPIHandler";

jest.mock("../src/common/client/HttpAxiosClient");
jest.mock("../src/common/utils/URLUtils");
jest.mock("../src/common/utils/HttpResponseUtils");
jest.mock("../src/common/utils/DataFileWriterUtils");
jest.mock("../src/common/utils/GuidGenerator");
jest.mock("../src/common/logger/Logger");
jest.mock("../src/common/utils/FileUtils");
jest.mock("../src/common/utils/CryptoUtils");

describe("PresignedURLAPIHandler", () => {
    let handler: PresignedURLAPIHandler;
    let mockHttpClient: any;
    let mockFileWriter: any;

    const fakeGuid = "guid-xyz";
    const fileName = "test.xml";
    const xmlMD5 = "MD5VALUE==";

    const baseRequest = {
        id: "",
        parameter: [
            {
                part: [
                    { name: "filename", valueString: fileName },
                    { name: "content-md5" },
                    { name: "filesize" }
                ]
            }
        ]
    };

    const mockAppSettings = {
        BaseFileLocationFolder: "/tmp",
        PresignedURLAPI: {
            ContentType: "application/json",
            Accept: "application/fhir+json",
            EndpointURL: "https://api.com/presigned",
            HttpClientRequestTimeOutSeconds: 5,
            Request: JSON.parse(JSON.stringify(baseRequest))
        }
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock GUID
        (GuidGenerator.generate as jest.Mock).mockReturnValue(fakeGuid);

        // File path resolution
        (FileUtils.getFullFilePath as jest.Mock).mockReturnValue("/tmp/" + fileName);

        // Crypto Utils
        (CryptoUtils.computeContentMd5String as jest.Mock).mockReturnValue(xmlMD5);

        // File size
        (FileUtils.getFileSizeInMB as jest.Mock).mockReturnValue(12.5);

        // URL Parsing
        (URLUtils.parseUrl as jest.Mock).mockReturnValue({
            baseUrl: "https://api.com",
            resourcePath: "/presigned"
        });

        // HttpAxiosClient mock instance
        mockHttpClient = {
            toCurl: jest.fn().mockResolvedValue("curl cmd"),
            post: jest.fn()
        };
        (HttpAxiosClient as jest.Mock).mockImplementation(() => mockHttpClient);

        // File writer mock
        mockFileWriter = {
            writeJson: jest.fn().mockResolvedValue(undefined),
            writeText: jest.fn().mockResolvedValue(undefined)
        };
        (DataFileWriterUtils as jest.Mock).mockImplementation(() => mockFileWriter);

        handler = new PresignedURLAPIHandler(mockAppSettings, "access-token-xyz");
    });

    // --------------------------------------------------------------------
    test("generates ID when Request.id is empty and guidId is provided", async () => {
        mockHttpClient.post.mockResolvedValue({
            success: true,
            response: {
                status: 200,
                data: { ok: true }
            }
        });

        await handler.getPresignedURLAsync("incoming-guid");

        expect(mockHttpClient.post).toHaveBeenCalledWith(
            "/presigned",
            expect.objectContaining({ id: "incoming-guid" })
        );
    });

    // --------------------------------------------------------------------
    test("computes MD5 and filesize when missing from request", async () => {
        mockHttpClient.post.mockResolvedValue({
            success: true,
            response: { status: 200, data: {} }
        });

        await handler.getPresignedURLAsync("");

        const requestSent = mockHttpClient.post.mock.calls[0][1];

        const parameter = requestSent.parameter[0].part;

        const md5Part = parameter.find((p: any) => p.name === "content-md5");
        const sizePart = parameter.find((p: any) => p.name === "filesize");

        expect(md5Part.valueString).toBe(xmlMD5);
        expect(sizePart.valueString).toBe("12.5");
    });

    // --------------------------------------------------------------------
    test("correctly sets headers and calls HttpAxiosClient", async () => {
        mockHttpClient.post.mockResolvedValue({
            success: true,
            response: { status: 200, data: {} }
        });

        await handler.getPresignedURLAsync(fakeGuid);

        expect(HttpAxiosClient as jest.Mock).toHaveBeenCalledWith(
            "https://api.com",
            expect.objectContaining({
                "Content-Type": "application/json",
                Accept: "application/fhir+json",
                Authorization: "Bearer access-token-xyz"
            }),
            5000
        );
    });

    // --------------------------------------------------------------------
    test("writes request, cURL, and success response", async () => {
        const apiResponse = {
            success: true,
            response: {
                status: 200,
                data: { presigned: true }
            }
        };

        mockHttpClient.post.mockResolvedValue(apiResponse);

        await handler.getPresignedURLAsync(fakeGuid);

        expect(mockFileWriter.writeJson).toHaveBeenCalledWith(
            "presigned-url-nodejs",
            `Request-${fakeGuid}`,
            expect.any(Object)
        );

        expect(mockFileWriter.writeText).toHaveBeenCalledWith(
            "presigned-url-nodejs",
            "curl",
            "curl cmd"
        );

        expect(mockFileWriter.writeJson).toHaveBeenCalledWith(
            "presigned-url-nodejs",
            `response-success-${fakeGuid}`,
            apiResponse.response.data
        );
    });

    // --------------------------------------------------------------------
    test("handles unsuccessful API response", async () => {
        const apiResponse = {
            success: false,
            response: { status: 400, data: { error: "bad" } }
        };

        const failedConverted = {
            error: "converted",
            response: { message: "failed here" }
        };
        (HttpResponseUtils.getFailedResponseObject as jest.Mock).mockReturnValue(failedConverted);

        mockHttpClient.post.mockResolvedValue(apiResponse);

        const result = await handler.getPresignedURLAsync(fakeGuid);

        expect(logger.error).toHaveBeenCalledWith(
            "Failed processing presigned URL API Request Data!"
        );

        expect(mockFileWriter.writeJson).toHaveBeenCalledWith(
            "presigned-url-nodejs",
            `response-failed-${fakeGuid}`,
            failedConverted.response
        );

        expect(result).toBe(failedConverted);
    });

    // --------------------------------------------------------------------
    test("response-failed is written when status != 200 but success=true", async () => {
        const apiResponse = {
            success: true,
            response: {
                status: 403,
                data: { denied: true }
            }
        };

        mockHttpClient.post.mockResolvedValue(apiResponse);

        await handler.getPresignedURLAsync(fakeGuid);

        expect(mockFileWriter.writeJson).toHaveBeenCalledWith(
            "presigned-url-nodejs",
            `response-failed-${fakeGuid}`,
            apiResponse.response.data
        );
    });

    // --------------------------------------------------------------------
    describe("processPresignedURLResponse", () => {
        test("extracts valueString and valueUrl pairs correctly", async () => {
            const response = {
                parameter: [
                    {
                        part: [
                            {
                                part: [
                                    { name: "foo", valueString: "bar" },
                                    { name: "url", valueUrl: "https://upload" }
                                ]
                            }
                        ]
                    }
                ]
            };

            const result = await handler.processPresignedURLResponse(response as any);

            expect(result.length).toBe(1);
            expect(result[0].partValueString).toEqual({ name: "foo", valueString: "bar" });
            expect(result[0].partValueUrl).toEqual({ name: "url", valueUrl: "https://upload" });
            expect(logger.info).toHaveBeenCalled();
        });

        test("returns empty array when no parameters", async () => {
            const result = await handler.processPresignedURLResponse({} as any);
            expect(result).toEqual([]);
        });
    });
});
