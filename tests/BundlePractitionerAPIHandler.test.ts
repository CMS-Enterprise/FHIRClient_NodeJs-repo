
import { HttpAxiosClient } from "../src/common/client/HttpAxiosClient";
import { URLUtils } from "../src/common/utils/URLUtils";
import { HttpResponseUtils } from "../src/common/utils/HttpResponseUtils";
import { DataFileWriterUtils } from "../src/common/utils/DataFileWriterUtils";
import { GuidGenerator } from "../src/common/utils/GuidGenerator";
import { logger } from "../src/common/logger/Logger";
import { BundlePractitionerAPIHandler } from "../src/bundle-submission-api/BundlePractitionerAPIHandler";

jest.mock("../src/common/client/HttpAxiosClient");
jest.mock("../src/common/utils/URLUtils");
jest.mock("../src/common/utils/HttpResponseUtils");
jest.mock("../src/common/utils/DataFileWriterUtils");
jest.mock("../src/common/utils/GuidGenerator");
jest.mock("../src/common/logger/Logger");

describe("BundlePractitionerAPIHandler", () => {
    let handler: BundlePractitionerAPIHandler;
    let mockHttpClient: any;
    let mockFileWriter: any;

    const fakeGuid = "abc-123";

    const mockAppSettings = {
        BaseFileLocationFolder: "/tmp",
        BundlePractitionerAPI: {
            ContentType: "application/json",
            Accept: "application/fhir+json",
            EndpointURL: "https://example.com/practitioner",
            HttpClientRequestTimeOutSeconds: 5,
            Request: {
                practitionerReference: "${PractitionerIdValue}",
                data: {
                    id: "${PractitionerIdValue}",
                    field: "value"
                }
            }
        }
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();

        // mock URL parsing
        (URLUtils.parseUrl as jest.Mock).mockReturnValue({
            baseUrl: "https://example.com",
            resourcePath: "/practitioner"
        });

        // mock GUID generation when not provided
        (GuidGenerator.generate as jest.Mock).mockReturnValue(fakeGuid);

        // mock HttpAxiosClient instance behavior
        mockHttpClient = {
            toCurl: jest.fn().mockResolvedValue("curl command"),
            post: jest.fn()
        };
        (HttpAxiosClient as jest.Mock).mockImplementation(() => mockHttpClient);

        // mock file writer instance
        mockFileWriter = {
            writeJson: jest.fn().mockResolvedValue(undefined),
            writeText: jest.fn().mockResolvedValue(undefined)
        };
        (DataFileWriterUtils as jest.Mock).mockImplementation(() => mockFileWriter);

        handler = new BundlePractitionerAPIHandler(mockAppSettings, "fakeToken123");
    });

    // --------------------------------------------------------------------
    test("processes successful request and writes response JSON", async () => {
        const apiResponse = {
            success: true,
            response: {
                status: 200,
                data: { result: "OK", something: 123 }
            }
        };

        mockHttpClient.post.mockResolvedValue(apiResponse);

        const result = await handler.processBundlePractitionerRequestAsync(fakeGuid);

        // check that placeholder was replaced correctly
        expect(mockHttpClient.post).toHaveBeenCalledWith(
            "/practitioner",
            expect.objectContaining({
                practitionerReference: fakeGuid,
                data: { id: fakeGuid, field: "value" }
            })
        );

        // correct header injection
        expect(HttpAxiosClient as jest.Mock).toHaveBeenCalledWith(
            "https://example.com",
            expect.objectContaining({
                "Content-Type": "application/json",
                Accept: "application/fhir+json",
                Authorization: "Bearer fakeToken123"
            }),
            5000
        );

        // cURL writeout
        expect(mockFileWriter.writeText).toHaveBeenCalledWith(
            "bundle-practitioner-nodejs",
            "curl",
            "curl command"
        );

        // success JSON writes
        expect(mockFileWriter.writeJson).toHaveBeenCalledWith(
            "bundle-practitioner-nodejs",
            `response-success-${fakeGuid}`,
            apiResponse.response.data
        );

        expect(result).toEqual(apiResponse.response.data);

        expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("Outgoing cURL"));
    });

    // --------------------------------------------------------------------
    test("generates GUID when not supplied", async () => {
        mockHttpClient.post.mockResolvedValue({
            success: true,
            response: {
                status: 200,
                data: { ok: true }
            }
        });

        await handler.processBundlePractitionerRequestAsync();

        // ensures GUID was used for placeholder
        expect(mockHttpClient.post).toHaveBeenCalledWith(
            "/practitioner",
            expect.objectContaining({
                practitionerReference: fakeGuid,
                data: { id: fakeGuid, field: "value" }
            })
        );
    });

    // --------------------------------------------------------------------
    test("handles unsuccessful response and writes failed JSON", async () => {
        const apiResponse = {
            success: false,
            response: { status: 500, data: { error: "broken" } }
        };

        mockHttpClient.post.mockResolvedValue(apiResponse);

        const failedConverted = {
            error: "bad",
            response: { message: "server down" }
        };
        (HttpResponseUtils.getFailedResponseObject as jest.Mock).mockReturnValue(failedConverted);

        const result = await handler.processBundlePractitionerRequestAsync(fakeGuid);

        expect(logger.error).toHaveBeenCalledWith(
            "Failed processing Bundle Practitioner API Request Data!"
        );

        expect(mockFileWriter.writeJson).toHaveBeenCalledWith(
            "bundle-practitioner-nodejs",
            `response-failed-${fakeGuid}`,
            failedConverted.response
        );

        expect(result).toBe(failedConverted);
    });

    // --------------------------------------------------------------------
    test("uses correct response-success or response-failed name based on status code", async () => {
        // simulate non-200 but still success flag
        const apiResponse = {
            success: true,
            response: {
                status: 400,
                data: { error: "client bad" }
            }
        };

        mockHttpClient.post.mockResolvedValue(apiResponse);

        await handler.processBundlePractitionerRequestAsync(fakeGuid);

        expect(mockFileWriter.writeJson).toHaveBeenCalledWith(
            "bundle-practitioner-nodejs",
            `response-failed-${fakeGuid}`, // because status != 200
            apiResponse.response.data
        );
    });

    // --------------------------------------------------------------------
    test("writes request payload to disk before writing curl", async () => {
        mockHttpClient.post.mockResolvedValue({
            success: true,
            response: { status: 200, data: { ok: true } }
        });

        await handler.processBundlePractitionerRequestAsync(fakeGuid);

        expect(mockFileWriter.writeJson).toHaveBeenCalledWith(
            "bundle-practitioner-nodejs",
            `request-${fakeGuid}`,
            expect.any(Object)
        );

        expect(mockFileWriter.writeText).toHaveBeenCalledWith(
            "bundle-practitioner-nodejs",
            "curl",
            "curl command"
        );
    });
});
