
import { HttpAxiosClient } from '../src/common/client/HttpAxiosClient';
import { DataFileWriterUtils } from '../src/common/utils/DataFileWriterUtils';
import { HttpResponseUtils } from '../src/common/utils/HttpResponseUtils';
import { GuidGenerator } from '../src/common/utils/GuidGenerator';
import { URLUtils } from '../src/common/utils/URLUtils';
import { logger } from '../src/common/logger/Logger';
import { NotificationAPIHander } from '../src/notification-retrieval-api/NotificationAPIHander';

import { CommonFailedResponse } from '../src/common/models/CommonFailedResponse';
import { NotificationResponse } from '../src/notification-retrieval-api/models/NotificationResponse';
import { ClientResponseTest } from '../src/common/client/models/ClientResponse';

jest.mock('../src/common/client/HttpAxiosClient');
jest.mock('../src/common/utils/DataFileWriterUtils');
jest.mock('../src/common/utils/HttpResponseUtils');
jest.mock('../src/common/utils/GuidGenerator');
jest.mock('../src/common/utils/URLUtils');
jest.mock('../src/common/logger/Logger');



// --- Helper for strongly typed mocks ---
function typedMock<T>(obj: T): jest.Mocked<T> {
  return obj as jest.Mocked<T>;
}

describe('NotificationAPIHander', () => {
  const mockAppSettings = {
    NotificationRetrievalAPI: {
      Accept: 'application/json',
      EndpointURL: 'https://api.example.com/notifications',
      HttpClientRequestTimeOutSeconds: 5,
      RequestParameters: [
        { inject: true, name: 'userId', value: '123' },
        { inject: false, name: 'ignore', value: 'nope' },
      ],
    },
    BaseFileLocationFolder: '/tmp',
  };

  const mockToken = 'test-token';
  const mockGuid = 'guid-123';
  const mockCurlCommand = 'curl https://api.example.com/notifications';

  // Typed mocks
  let MockHttpAxiosClient = typedMock(HttpAxiosClient);
  let MockDataFileWriterUtils = typedMock(DataFileWriterUtils);
  let MockHttpResponseUtils = typedMock(HttpResponseUtils);
  let MockGuidGenerator = typedMock(GuidGenerator);
  let MockURLUtils = typedMock(URLUtils);
  let MockLogger = typedMock(logger);

  // Instance-level mocks
  let mockHttpClient: jest.Mocked<HttpAxiosClient>;
  let mockFileWriter: jest.Mocked<DataFileWriterUtils>;
  let handler: NotificationAPIHander;

  beforeEach(() => {
    jest.resetAllMocks();

    MockGuidGenerator.generate.mockReturnValue(mockGuid);
    MockURLUtils.parseUrl.mockReturnValue({
      baseUrl: 'https://api.example.com',
      resourcePath: '/notifications',
    });

    mockHttpClient = {
      get: jest.fn(),
      toCurl: jest.fn().mockResolvedValue(mockCurlCommand),
    } as unknown as jest.Mocked<HttpAxiosClient>;

    (HttpAxiosClient as unknown as jest.Mock).mockImplementation(() => mockHttpClient);

    mockFileWriter = {
      writeText: jest.fn(),
      writeJson: jest.fn(),
    } as unknown as jest.Mocked<DataFileWriterUtils>;

    (DataFileWriterUtils as unknown as jest.Mock).mockImplementation(() => mockFileWriter);

    handler = new NotificationAPIHander(mockAppSettings as any, mockToken);
  });

  it('should retrieve notifications successfully', async () => {
    const mockResponse: ClientResponseTest = {
      success: true,
      response: { data: { notifications: ['A', 'B'] } },
    };

    mockHttpClient.get.mockResolvedValue(mockResponse);

    const result = await handler.getNotificationsAsync();

    // Verify correct construction
    expect(HttpAxiosClient).toHaveBeenCalledWith(
      'https://api.example.com',
      {
        Accept: 'application/json',
        Authorization: `Bearer ${mockToken}`,
      },
      5000
    );

    // Verify request and curl usage
    expect(mockHttpClient.toCurl).toHaveBeenCalledWith('/notifications?userId=123', 'GET');
    expect(MockLogger.info).toHaveBeenCalledWith(`Outgoing cURL: ${mockCurlCommand}`);

    // Verify file writes
    expect(mockFileWriter.writeText).toHaveBeenCalledWith('notification-retrieval-nodejs', 'curl', mockCurlCommand);
    expect(mockFileWriter.writeJson).toHaveBeenCalledWith(
      'notification-retrieval-nodejs',
      `response-failed-${mockGuid}`,
      { notifications: ['A', 'B'] }
    );

    expect(result).toEqual({ notifications: ['A', 'B'] } as NotificationResponse);
  });

  it('should handle failed response', async () => {
    const failedResponse: ClientResponseTest = {
      success: false,
      response: { status: 400, message: 'Error' },
    };

    mockHttpClient.get.mockResolvedValue(failedResponse);

    const failedResult: CommonFailedResponse = {
      status: 404,
      response: { error: 'Bad request' },
    };

    MockHttpResponseUtils.getFailedResponseObject.mockReturnValue(failedResult);

    const result = await handler.getNotificationsAsync();

    expect(MockLogger.error).toHaveBeenCalledWith('Failed processing Notification Retrieval Data!');
    expect(MockLogger.error).toHaveBeenCalledWith(`Response: ${failedResult.response}`);
    expect(mockFileWriter.writeJson).toHaveBeenCalledWith(
      'notification-retrieval-nodejs',
      `response-failed-${mockGuid}`,
      failedResult.response
    );
      console.log(JSON.stringify(result));
   
  });

  
});
