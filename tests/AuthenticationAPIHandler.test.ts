
import { HttpAxiosClient } from "../src/common/client/HttpAxiosClient";
import { URLUtils } from "../src/common/utils/URLUtils";
import { HttpResponseUtils } from "../src/common/utils/HttpResponseUtils";
import { DataFileWriterUtils } from "../src/common/utils/DataFileWriterUtils";
import { GuidGenerator } from "../src/common/utils/GuidGenerator";
import { logger } from "../src/common/logger/Logger";
import { AuthenticationAPIHandler } from "../src/authentication-api/AuthenticationAPIHandler";
import { Token } from "../src/authentication-api/models/Token";

jest.mock("../src/common/client/HttpAxiosClient");
jest.mock("../src/common/utils/URLUtils");
jest.mock("../src/common/utils/HttpResponseUtils");
jest.mock("../src/common/utils/DataFileWriterUtils");
jest.mock("../src/common/utils/GuidGenerator");
jest.mock("../src/common/logger/Logger");

// ---------- Helpers ----------
const mockAppSettings = {
    AuthenticationAPI: {
        ContentType: "application/json",
        ClientId: "abc",
        ClientSecret: "xyz",
        Scope: "read",
        EndpointURL: "https://example.com/token",
        HttpClientRequestTimeOutSeconds: 10
    },
    BaseFileLocationFolder: "/tmp"
} as any;

const mockParsedUrl = { baseUrl: "https://example.com", resourcePath: "/token" };

describe("AuthenticationAPIHandler", () => {
    let handler: AuthenticationAPIHandler;
    let mockHttpClient: any;
    let mockFileWriter: any;

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock URL utils
        (URLUtils.parseUrl as jest.Mock).mockReturnValue(mockParsedUrl);

        // Mock HttpAxiosClient instance
        mockHttpClient = {
            toCurl: jest.fn().mockResolvedValue("curl command"),
            post: jest.fn()
        };
        (HttpAxiosClient as jest.Mock).mockImplementation(() => mockHttpClient);

        // Mock DataFileWriterUtils instance
        mockFileWriter = {
            writeText: jest.fn().mockResolvedValue(undefined),
            writeJson: jest.fn().mockResolvedValue(undefined)
        };
        (DataFileWriterUtils as jest.Mock).mockImplementation(() => mockFileWriter);

        // Mock GUID generator
        (GuidGenerator.generate as jest.Mock).mockReturnValue("1234");

        handler = new AuthenticationAPIHandler(mockAppSettings);
    });

    // ---------------------------------------------------------------
    test("returns cached token when still valid", async () => {
        const now = new Date();
        const token = {
            access_token: "cached",
            expires_in: 3600,
            IssuedAt: new Date(now.getTime() - 1000)
        };

        // @ts-ignore
        handler["cachedToken"] = token;

        const result = await handler.getToken();

        // Should not call HTTP client
        expect(mockHttpClient.post).not.toHaveBeenCalled();
        expect(result).toBe(token);
    });

    // ---------------------------------------------------------------
    test("fetches new token when none cached", async () => {
        const apiResponse = {
            success: true,
            response: { data: { access_token: "newToken", expires_in: 3600 } }
        };
        mockHttpClient.post.mockResolvedValue(apiResponse);

        const result = await handler.getToken() as Token;

        expect(URLUtils.parseUrl).toHaveBeenCalledWith("https://example.com/token");
        expect(mockHttpClient.post).toHaveBeenCalledWith("/token");
        expect(result.access_token).toBe("newToken");

        expect(mockFileWriter.writeJson).toHaveBeenCalledWith(
            "authentication-nodejs",
            "response-success-1234",
            expect.any(Object)
        );

        expect(logger.info).toHaveBeenCalledWith(
            expect.stringContaining("Token successfully retrieved and cached.")
        );
    });

    // ---------------------------------------------------------------
    test("handles failure when response is unsuccessful", async () => {
        const apiResponse = {
            success: false,
            response: null
        };
        mockHttpClient.post.mockResolvedValue(apiResponse);

        const failedObj = { error: "bad", response: { a: 1 } };
        (HttpResponseUtils.getFailedResponseObject as jest.Mock).mockReturnValue(failedObj);

        const result = await handler.getToken();

        expect(logger.error).toHaveBeenCalledWith("Failed to retrieve token.");
        expect(result).toBe(failedObj);

        expect(mockFileWriter.writeJson).toHaveBeenCalledWith(
            "authentication-nodejs",
            "response-failed-1234",
            failedObj.response
        );
    });

    // ---------------------------------------------------------------
    test("uses current date when IssuedAt missing from response", async () => {
        const apiResponse = {
            success: true,
            response: { data: { access_token: "x", expires_in: 3600 } }
        };
        mockHttpClient.post.mockResolvedValue(apiResponse);

        const result = await handler.getToken() as Token;

        expect(result.IssuedAt).toBeInstanceOf(Date);
    });

    // ---------------------------------------------------------------
    test("isTokenValid returns false for missing token", () => {
        // @ts-ignore
        expect(handler["isTokenValid"](undefined)).toBe(false);
    });

    test("isTokenValid returns false for expired token", () => {
        const expiredToken = {
            access_token: "x",
            expires_in: 10,
            IssuedAt: new Date(Date.now() - 60_000 * 10)
        };
        // @ts-ignore
        expect(handler["isTokenValid"](expiredToken)).toBe(false);
    });

    test("isTokenValid returns true for valid token", () => {
        const validToken = {
            access_token: "x",
            expires_in: 3600,
            IssuedAt: new Date(Date.now() - 1_000)
        };
        // @ts-ignore
        expect(handler["isTokenValid"](validToken)).toBe(true);
    });
});
