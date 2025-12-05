
import { HttpAxiosClient } from "../src/common/client/HttpAxiosClient";
import { URLUtils } from "../src/common/utils/URLUtils";
import { HttpResponseUtils } from "../src/common/utils/HttpResponseUtils";
import { DataFileWriterUtils } from "../src/common/utils/DataFileWriterUtils";
import { GuidGenerator } from "../src/common/utils/GuidGenerator";
import { logger } from "../src/common/logger/Logger";
import { FileUtils } from "../src/common/utils/FileUtils";
import { CryptoUtils } from "../src/common/utils/CryptoUtils";
import * as fs from "fs/promises";
import { ClnicalDocumentUploadAPIHandler } from "../src/bundle-submission-api/ClnicalDocumentUploadAPIHandler";

jest.mock("../src/common/client/HttpAxiosClient");
jest.mock("../src/common/utils/URLUtils");
jest.mock("../src/common/utils/HttpResponseUtils");
jest.mock("../src/common/utils/DataFileWriterUtils");
jest.mock("../src/common/utils/GuidGenerator");
jest.mock("../src/common/logger/Logger");
jest.mock("../src/common/utils/FileUtils");
jest.mock("../src/common/utils/CryptoUtils");
jest.mock("fs/promises");

describe("ClnicalDocumentUploadAPIHandler", () => {
    let handler: ClnicalDocumentUploadAPIHandler;
    let mockHttpClient: any;
    let mockFileWriter: any;

    const fakeGuid = "guid-1234";
    const xmlContent = "<ClinicalDocument>Example</ClinicalDocument>";
    const presignedURL = "https://upload.com/upload?signature=abc&expires=999";
    const fileName = "doc.xml";

    const mockAppSettings = {
        BaseFileLocationFolder: "/tmp",
        UploadClinicalDocumentAPI: {
            ContentType: "application/xml",
            HttpClientRequestTimeOutSeconds: 10
        }
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();

        // fs mock
        (fs.readFile as jest.Mock).mockResolvedValue(xmlContent);

        // FileUtils mock
        (FileUtils.getFullFilePath as jest.Mock).mockReturnValue("/tmp/doc.xml");

        // crypto mocks
        (CryptoUtils.computeContentMd5String as jest.Mock).mockReturnValue("abcd1234==");
        (CryptoUtils.convertBase64StringToBytes as jest.Mock).mockReturnValue(Buffer.from("abcd1234==", "utf8"));

        // URL parsing behavior
        (URLUtils.parseUrl as jest.Mock).mockReturnValue({
            baseUrl: "https://upload.com",
            resourcePath: "/upload",
            params: { signature: "abc", expires: "999" }
        });
        (URLUtils.paramsToQueryString as jest.Mock).mockReturnValue("signature=abc&expires=999");

        // GUID
        (GuidGenerator.generate as jest.Mock).mockReturnValue(fakeGuid);

        // mock HttpAxiosClient
        mockHttpClient = {
            toCurl: jest.fn().mockResolvedValue("curl cmd"),
            postXMLData: jest.fn()
        };
        (HttpAxiosClient as jest.Mock).mockImplementation(() => mockHttpClient);

        // file writer mock
        mockFileWriter = {
            writeJson: jest.fn().mockResolvedValue(undefined),
            writeText: jest.fn().mockResolvedValue(undefined)
        };
        (DataFileWriterUtils as jest.Mock).mockImplementation(() => mockFileWriter);

        handler = new ClnicalDocumentUploadAPIHandler(mockAppSettings, "token-xyz");
    });

    // --------------------------------------------------------------------
    test("successfully uploads XML and writes success response", async () => {
        const apiResponse = {
            success: true,
            response: {
                status: 200,
                data: { status: "OK", id: 123 }
            }
        };

        mockHttpClient.postXMLData.mockResolvedValue(apiResponse);

        const result = await handler.uploadClinicalDocumentAsync(presignedURL, fileName);

        // validate file reading
        expect(fs.readFile).toHaveBeenCalledWith("/tmp/doc.xml", "utf-8");

        // validate MD5 usage
        expect(CryptoUtils.computeContentMd5String).toHaveBeenCalledWith("/tmp/doc.xml");
        expect(CryptoUtils.convertBase64StringToBytes).toHaveBeenCalledWith("abcd1234==");

        // validate HttpAxiosClient setup
        expect(HttpAxiosClient as jest.Mock).toHaveBeenCalledWith(
            "https://upload.com",
            expect.objectContaining({
                "Content-Type": "application/xml",
                Accept: "*/*",
                Authorization: "Bearer token-xyz",
                "Content-Length": Buffer.byteLength(xmlContent).toString(),
                "Content-MD5": expect.any(String)
            }),
            10000,
            { signature: "abc", expires: "999" }
        );

        // validate POST call
        expect(mockHttpClient.postXMLData).toHaveBeenCalledWith("/upload", xmlContent);

        // validate cURL writing
        expect(mockFileWriter.writeText).toHaveBeenCalledWith(
            "upload-clinical-document-nodejs",
            "curl",
            "curl cmd"
        );

        // validate request saved
        expect(mockFileWriter.writeJson).toHaveBeenCalledWith(
            "upload-clinical-document-nodejs",
            `Request-${fakeGuid}`,
            xmlContent
        );

        // validate success response saved
        expect(mockFileWriter.writeJson).toHaveBeenCalledWith(
            "upload-clinical-document-nodejs",
            `response-success-${fakeGuid}`,
            apiResponse.response.data
        );

        expect(result).toEqual(apiResponse.response.data);
    });

    // --------------------------------------------------------------------
    test("handles failed upload, writes error response", async () => {
        const apiResponse = {
            success: false,
            response: {
                status: 500,
                data: { error: "server down" }
            }
        };

        mockHttpClient.postXMLData.mockResolvedValue(apiResponse);

        const failedConverted = {
            error: "bad",
            response: { message: "server fail" }
        };
        (HttpResponseUtils.getFailedResponseObject as jest.Mock).mockReturnValue(failedConverted);

        const result = await handler.uploadClinicalDocumentAsync(presignedURL, fileName);

        expect(logger.error).toHaveBeenCalledWith(
            "Failed processing presigned URL API Request Data!"
        );

        expect(mockFileWriter.writeJson).toHaveBeenCalledWith(
            "upload-clinical-document-nodejs",
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
                status: 400,
                data: { bad: "request" }
            }
        };

        mockHttpClient.postXMLData.mockResolvedValue(apiResponse);

        await handler.uploadClinicalDocumentAsync(presignedURL, fileName);

        expect(mockFileWriter.writeJson).toHaveBeenCalledWith(
            "upload-clinical-document-nodejs",
            `response-failed-${fakeGuid}`,
            apiResponse.response.data
        );
    });

    // --------------------------------------------------------------------
    test("writes correct request and cURL order", async () => {
        mockHttpClient.postXMLData.mockResolvedValue({
            success: true,
            response: { status: 200, data: {} }
        });

        await handler.uploadClinicalDocumentAsync(presignedURL, fileName);

        expect(mockFileWriter.writeJson).toHaveBeenCalledWith(
            "upload-clinical-document-nodejs",
            `Request-${fakeGuid}`,
            xmlContent
        );
        expect(mockFileWriter.writeText).toHaveBeenCalledWith(
            "upload-clinical-document-nodejs",
            "curl",
            "curl cmd"
        );
    });
});
