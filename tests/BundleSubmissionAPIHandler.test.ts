
import { HttpAxiosClient } from "../src/common/client/HttpAxiosClient";
import { GuidGenerator } from "../src/common/utils/GuidGenerator";
import { URLUtils } from "../src/common/utils/URLUtils";
import { DataFileWriterUtils } from "../src/common/utils/DataFileWriterUtils";
import { DateTimeUtil } from "../src/common/utils/DateTimeUtil";
import { FileUtils } from "../src/common/utils/FileUtils";
import { CryptoUtils } from "../src/common/utils/CryptoUtils";
import { RequestTransformerUtil } from "../src/common/utils/RequestTransformerUtil";
import { HttpResponseUtils } from "../src/common/utils/HttpResponseUtils";
import { logger } from "../src/common/logger/Logger";
import { BundleSubmissionAPIHandler } from "../src/bundle-submission-api/BundleSubmissionAPIHandler";

jest.mock("../src/common/client/HttpAxiosClient");
jest.mock("../src/common/utils/GuidGenerator");
jest.mock("../src/common/utils/URLUtils");
jest.mock("../src/common/utils/DataFileWriterUtils");
jest.mock("../src/common/utils/DateTimeUtil");
jest.mock("../src/common/utils/FileUtils");
jest.mock("../src/common/utils/CryptoUtils");
jest.mock("../src/common/utils/RequestTransformerUtil");
jest.mock("../src/common/utils/HttpResponseUtils");
jest.mock("../src/common/logger/Logger");

describe("BundleSubmissionAPIHandler", () => {

    const mockAppSettings = {
        BaseFileLocationFolder: "/tmp",
        BundleSubmissionAPI: {
            ContentType: "application/json",
            Accept: "application/json",
            EndpointURL: "https://api.test.com/bundle",
            HttpClientRequestTimeOutSeconds: 10,
            Request: {
                id: "",
                entry: []
            }
        }
    };

    const token = "mock-token";

    beforeEach(() => {
        jest.clearAllMocks();
        URLUtils.parseUrl = jest.fn().mockReturnValue({
            baseUrl: "https://api.test.com",
            resourcePath: "/bundle",
        });
    });

    // ---------------------------------------------------------------------
    //  processBundleSubmissionRequestAsync
    // ---------------------------------------------------------------------
    describe("processBundleSubmissionRequestAsync", () => {

        test("Successful submission → returns BundleSubmissionResponse", async () => {
            GuidGenerator.generate = jest.fn().mockReturnValue("generated-guid");

            const httpMock = {
                post: jest.fn().mockResolvedValue({
                    success: true,
                    response: {
                        status: 200,
                        data: { submitted: true }
                    }
                }),
                toCurl: jest.fn().mockResolvedValue("curl command")
            };
            (HttpAxiosClient as unknown as jest.Mock).mockImplementation(() => httpMock);

            const fileWriterMock = {
                writeJson: jest.fn(),
                writeText: jest.fn()
            };
            (DataFileWriterUtils as unknown as jest.Mock).mockImplementation(() => fileWriterMock);

            const handler = new BundleSubmissionAPIHandler(mockAppSettings as any, token);

            const result = await handler.processBundleSubmissionRequestAsync();

            expect(result).toEqual({ submitted: true });

            expect(httpMock.post).toHaveBeenCalled();
            expect(fileWriterMock.writeJson).toHaveBeenCalledTimes(2);
            expect(fileWriterMock.writeText).toHaveBeenCalledTimes(1);
        });


        test("Failed submission → returns CommonFailedResponse", async () => {
            const failedObject = { error: "Boom!" };

            GuidGenerator.generate = jest.fn().mockReturnValue("generated-guid");

            const httpMock = {
                post: jest.fn().mockResolvedValue({
                    success: false,
                    response: failedObject
                }),
                toCurl: jest.fn().mockResolvedValue("curl command")
            };
            (HttpAxiosClient as unknown as jest.Mock).mockImplementation(() => httpMock);

            const fileWriterMock = {
                writeJson: jest.fn(),
                writeText: jest.fn()
            };
            (DataFileWriterUtils as unknown as jest.Mock).mockImplementation(() => fileWriterMock);

            HttpResponseUtils.getFailedResponseObject = jest.fn().mockReturnValue({
                failed: true,
                response: failedObject
            });

            const handler = new BundleSubmissionAPIHandler(mockAppSettings as any, token);

            const result = await handler.processBundleSubmissionRequestAsync();

            expect(result).toEqual({
                failed: true,
                response: failedObject
            });
            expect(fileWriterMock.writeJson).toHaveBeenCalledWith(
                "bundle-submission-nodejs",
                expect.stringContaining("response-failed"),
                failedObject
            );
        });
    });

   
});
