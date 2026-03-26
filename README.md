
# esmd-fhir-client-nodejs
**Version:** 1.0.0

# esmd-fhir-client-nodejs - Enhanced FHIR Client Library

  

[![Node.js 23+](https://img.shields.io/badge/node.js-23+-green.svg)](https://nodejs.org/)

[![Code Quality](https://img.shields.io/badge/code%20quality-A-green.svg)](https://github.com/your-repo/esmd-fhir-client-nodejs)

[![Tests](https://img.shields.io/badge/tests-passing-green.svg)](https://github.com/your-repo/esmd-fhir-client-nodejs)

  

A comprehensive, production-ready NodeJS client library for interacting with esMD FHIR services. This client library support document submission, document retrieval, error handing and notifications, provider service registration, provider delivery acknowledgments, and esMD system reference data retrieval.

  

## 🚀 Key Features

### Core Functionality

-  **Bundle Submission**: Submit FHIR bundles with presigned URL support

-  **Practitioner Management**: Search, create, and manage practitioner resources

-  **Document Reference Handling**: Upload and manage document references

-  **Notification Processing**: Handle transaction notifications and lists

  

### Enhanced Features ✨

-  **🔒 Robust Authentication**: OAuth2 with token caching and automatic refresh

-  **🛡️ Error Handling**: Comprehensive exception hierarchy with detailed error context

-  **✅ Input Validation**: Comprehensive validation for all inputs

-  **📝 Comprehensive Logging**: Structured logging with configurable levels and audit trails

-  **🔍 Audit Trails**: Detailed audit logging for authentication and operations

-  **🧪 Extensive Testing**: 90%+ test coverage with unit and integration tests

-  **📦 Modular Design**: Import only the modules you need for your use case

  

## 📦 Installation

### Development Installation

```bash

git  clone  https://github.com/your-repo/esmd-fhir-client-nodejs.git

cd  esmd-fhir-client-nodejs

npm  install

```

  

## ⚙️ Configuration

### Environment Variables with .env File (Recommended)

The library supports loading configuration from a `.env` file for easier management.

#### .env File Structure

```bash

CLIENT_ID="your-client-id"
CLIENT_SECRET="your-client-secret"

```

  

### Environment Variables (Alternative)

You can also set environment variables directly:

  

```bash

# Authentication (Required)

export  CLIENT_ID="your-client-id"
export  CLIENT_SECRET="your-client-secret"

```

  

### Configuration File (appSettings.json) 

  
<details>


```json
{
  "AppSettings": {
    "HttpClientRequestTimeOutSeconds": 2.0,
    "BaseFileLocationFolder": "C:\\Users\\AmerMaqsood\\Downloads",
    "FHIRServerUrl": "https://terminology.esmdval.cms.gov:8099",
    "EndPointBaseUrl": "https://val.cpiapigateway.cms.gov",
    "AuthenticationAPI": {
      "ClientId": "",
      "ClientSecret": "",
      "Scope": "hih/esmdfhir",
      "EndpointURL": "${EndPointBaseUrl}/api/esmdf/auth/generate",
      "ContentType": "application/json",
      "HttpClientRequestTimeOutSeconds": 2.0,
      "UserAgent": "Refyne-FHIR-Client/1.0"
    },
    "PresignedURLAPI": {
      "EndpointURL": "${EndPointBaseUrl}/api/esmdf/v1/fhir/DocumentReference/$generate-presigned-url",
      "ContentType": "application/fhir+json",
      "Accept": "application/fhir+json",
      "HttpClientRequestTimeOutSeconds": 2.0,
      "Request": {
        "resourceType": "Parameters",
        "id": "",
        "parameter": [
          {
            "name": "organizationid",
            "valueString": "urn:oid:123.456.657.126"
          },
          {
            "name": "fileinfo",
            "part": [
              { "name": "filename", "valueString": "presigned_url_xml_file.xml" },
              { "name": "content-md5", "valueString": "" },
              { "name": "filesize", "valueString": "" },
              { "name": "mimetype", "valueString": "application/xml" }
            ]
          }
        ]
      }
    },
    "UploadClinicalDocumentAPI": {
      "ContentType": "application/xml",
      "HttpClientRequestTimeOutSeconds": 4.0,
      "FileName": "presigned_url_xml_file.xml",
      "ContentMD5": ""
    },
    "BundleSubmissionAPI": {
      "EndpointURL": "${EndPointBaseUrl}/api/esmdf/v1/fhir",
      "ContentType": "application/fhir+json",
      "Accept": "application/fhir+json",
      "HttpClientRequestTimeOutSeconds": 4.0
    },
    "NotificationRetrievalAPI": {
      "EndpointURL": "${EndPointBaseUrl}/api/esmdf/v1/fhir/List",
      "Accept": "application/fhir+json",
      "HttpClientRequestTimeOutSeconds": 4.0
    },
    "DocumentRetrievalAPI": {
      "EndpointURL": "${EndPointBaseUrl}/api/esmdf/v1/fhir/DocumentReference",
      "Accept": "application/fhir+json",
      "HttpClientRequestTimeOutSeconds": 2.0
    },
    "DeliveryConfirmationAPI": {
      "EndpointURL": "${EndPointBaseUrl}/api/esmdf/v1/fhir/List",
      "Accept": "application/fhir+json",
      "ContentType": "application/fhir+json",
      "HttpClientRequestTimeOutSeconds": 2.0
    },
    "PractitionerAPI": {
      "EndpointURL": "${EndPointBaseUrl}/api/esmdf/v1/fhir/Practitioner/{id}",
      "Accept": "application/fhir+json",
      "ContentType": "application/fhir+json",
      "HttpClientRequestTimeOutSeconds": 4.0
    },
    "BinaryAPI": {
      "EndpointURL": "${EndPointBaseUrl}/api/esmdf/v1/fhir/Binary/{id}",
      "Accept": "application/fhir+json",
      "FileNameId": "TXE0007232564EC_20250305105429_2",
      "HttpClientRequestTimeOutSeconds": 2.0
    },
    "BundlePractitionerAPI": {
      "EndpointURL": "${EndPointBaseUrl}/api/esmdf/v1/fhir",
      "ContentType": "application/fhir+json",
      "Accept": "application/fhir+json",
      "HttpClientRequestTimeOutSeconds": 4.0
    }
  }
}
```

</details>

  

**Note**: The library now prioritizes environment variables and `.env` files over JSON client id and secret configuration.

# 📘 AppSettings Configuration Guide

It is main configuration file to config all API calls. File appSettings.json is located under the config folder of the project.

The config file contains following api configuration sections that require config values to be provided by user:

## 🔹 Root: `AppSettings`

| Node | Description / Value |
|------|--------------------|
| `HttpClientRequestTimeOutSeconds` | Timeout (in seconds) for HTTP requests |
| `BaseFileLocationFolder` | Local folder path for file storage (`C:\Users\...`) |
| `FHIRServerUrl` | Base URL for FHIR server |
| `EndPointBaseUrl` | Base API gateway URL |

---

## 🔐 AuthenticationAPI

| Node | Description / Value |
|------|--------------------|
| `ClientId` | API client ID (provided by system) |
| `ClientSecret` | API client secret |
| `Scope` | Authorization scope (`hih/esmdfhir`) |
| `EndpointURL` | Auth API endpoint (`${EndPointBaseUrl}/api/esmdf/auth/generate`) |
| `ContentType` | Request content type (`application/json`) |
| `HttpClientRequestTimeOutSeconds` | Timeout for auth request |
| `UserAgent` | Client identifier string |

---

## 🔗 PresignedURLAPI

| Node | Description / Value |
|------|--------------------|
| `EndpointURL` | API to generate presigned upload URL |
| `ContentType` | `application/fhir+json` |
| `Accept` | Expected response type |
| `HttpClientRequestTimeOutSeconds` | Timeout |
| `Request.resourceType` | Always `"Parameters"` |
| `Request.parameter[].name` | Parameter name (e.g., `organizationid`, `fileinfo`) |
| `Request.parameter[].valueString` | Value for parameter |
| `Request.parameter[].part[]` | File metadata details |

---

## 📄 UploadClinicalDocumentAPI

| Node | Description / Value |
|------|--------------------|
| `ContentType` | File type (`application/xml`) |
| `HttpClientRequestTimeOutSeconds` | Timeout |
| `FileName` | Name of file to upload |
| `ContentMD5` | File checksum (optional) |

---

## 📦 BundleSubmissionAPI

| Node | Description / Value |
|------|--------------------|
| `EndpointURL` | Submission endpoint |
| `ContentType` | `application/fhir+json` |
| `Accept` | Response format |
| `HttpClientRequestTimeOutSeconds` | Timeout |
| `Request.resourceType` | `"Bundle"` |
| `Request.type` | `"transaction"` |
| `Request.entry[]` | Contains List + DocumentReference resources |

---

## 🔔 NotificationRetrievalAPI

| Node | Description / Value |
|------|--------------------|
| `EndpointURL` | API to fetch notifications |
| `Accept` | Response format |
| `HttpClientRequestTimeOutSeconds` | Timeout |
| `RequestParameters[]` | Query filters like status/type |

---

## 📥 DocumentRetrievalAPI

| Node | Description / Value |
|------|--------------------|
| `EndpointURL` | Fetch document metadata |
| `Accept` | Response format |
| `HttpClientRequestTimeOutSeconds` | Timeout |

---

## ✅ DeliveryConfirmationAPI

| Node | Description / Value |
|------|--------------------|
| `EndpointURL` | Confirmation endpoint |
| `Accept` | Response format |
| `ContentType` | Request format |
| `HttpClientRequestTimeOutSeconds` | Timeout |
| `Request.resourceType` | `"List"` |
| `Request.extension[]` | Metadata like transaction ID, org ID |

---

## 👩‍⚕️ PractitionerAPI

| Node | Description / Value |
|------|--------------------|
| `EndpointURL` | Practitioner API endpoint |
| `Accept` | Response format |
| `ContentType` | Request format |
| `HttpClientRequestTimeOutSeconds` | Timeout |
| `Request.resourceType` | `"Practitioner"` |
| `Request.name[]` | Name details |
| `Request.telecom[]` | Contact info |
| `Request.address[]` | Address |
| `Request.extension[]` | Custom fields (NPI, Tax ID, etc.) |

---

## 📎 BinaryAPI

| Node | Description / Value |
|------|--------------------|
| `EndpointURL` | Binary file retrieval endpoint |
| `Accept` | Response format |
| `FileNameId` | File identifier |
| `HttpClientRequestTimeOutSeconds` | Timeout |

---

## 👨‍⚕️ BundlePractitionerAPI

| Node | Description / Value |
|------|--------------------|
| `EndpointURL` | Batch practitioner submission |
| `ContentType` | `application/fhir+json` |
| `Accept` | Response format |
| `HttpClientRequestTimeOutSeconds` | Timeout |
| `Request.resourceType` | `"Bundle"` |
| `Request.type` | `"batch"` |
| `Request.entry[]` | Multiple practitioner records |
  


## 🏃‍♂️ Quick Start

### 🧩 Modular Library Usage

The library is **modular**, allowing you to import only the components you need. This keeps your code clean and optimized.

```ts
// Import only the modules you need
import { logger } from './common/logger/Logger';
import { AppSettingsLoader } from './common/config/AppSettingsLoader';
import { AppSettings } from './common/config/models/AppSettings';
import { Token } from './authentication-api/models/Token';
import { CommonFailedResponse } from './common/models/CommonFailedResponse';
import { AuthenticationAPIHandler } from './authentication-api/AuthenticationAPIHandler';
import { DeliveryConfirmationResponse } from './document-retrieval-api/models/DeliveryConfirmationResponse';
import { DeliveryConfirmationAPIHandler } from './document-retrieval-api/DeliveryConfirmationAPIHandler';
import { GuidGenerator } from './common/utils/GuidGenerator';
import { NotificationResponse } from './notification-retrieval-api/models/NotificationResponse';
import { NotificationAPIHander } from './notification-retrieval-api/NotificationAPIHander';
import { PractitionerResponse } from './practitioner-api/models/PractitionerResponse';
import { PractitionerAPIHandler } from './practitioner-api/PractitionerAPIHandler';
import { BinaryClientResponse } from './document-retrieval-api/models/BinaryClientResponse';
import { BinaryClientAPIHandler } from './document-retrieval-api/BinaryClientAPIHandler';
import { DocumentRetrievalResponse } from './document-retrieval-api/models/DocumentRetrievalResponse';
import { DocumentRetrievalAPIHandler } from './document-retrieval-api/DocumentRetrievalAPIHandler';
import { BundlePractitionerResponse } from './bundle-submission-api/models/BundlePractitionerResponse';
import { BundlePractitionerAPIHandler } from './bundle-submission-api/BundlePractitionerAPIHandler';
import { PresignedURLAPIHandler } from './bundle-submission-api/PresignedURLAPIHandler';
import { PresignedURLResponse } from './bundle-submission-api/models/PresignedURLResponse';
import { ClnicalDocumentUploadAPIHandler } from './bundle-submission-api/ClnicalDocumentUploadAPIHandler';
import { PresignedURLInfo } from './bundle-submission-api/models/PresignedURLInfo';
import { UploadClinicalDocumentResponse } from './bundle-submission-api/models/UploadClinicalDocumentResponse';
import { BundleSubmissionResponse } from './bundle-submission-api/models/BundleSubmissionResponse';
import { BundleSubmissionAPIHandler } from './bundle-submission-api/BundleSubmissionAPIHandler';

```

💡 **Explanation**

- **Modular Imports**  
  You can import only the modules you need from the library to keep your code lightweight and focused.

- **Logger**  
  Provides logging functionality for tracking the flow and debugging.

- **AppSettingsLoader & AppSettings**  
  Load and hold configuration settings for the application, including API endpoints and credentials.

- **AuthenticationAPIHandler & Token**  
  Handle authentication requests and store access tokens for API calls.

- **DeliveryConfirmationAPIHandler & DeliveryConfirmationResponse**  
  Handle bundle delivery confirmations and responses from the server.

- **GuidGenerator**  
  Generates unique identifiers for requests, ensuring traceability.

- **NotificationAPIHander & NotificationResponse**  
  Retrieve notifications related to submitted bundles or system events.

- **PractitionerAPIHandler & PractitionerResponse**  
  Fetch practitioner-related data from the API.

- **BinaryClientAPIHandler & BinaryClientResponse**  
  Fetch binary files or documents stored in the system.

- **DocumentRetrievalAPIHandler & DocumentRetrievalResponse**  
  Retrieve FHIR document data from the server.

- **BundlePractitionerAPIHandler & BundlePractitionerResponse**  
  Handle practitioner-related bundle requests.

- **PresignedURLAPIHandler, PresignedURLResponse & PresignedURLInfo**  
  Generate pre-signed URLs for secure document uploads.

- **ClnicalDocumentUploadAPIHandler & UploadClinicalDocumentResponse**  
  Upload clinical documents using the generated pre-signed URLs.

- **BundleSubmissionAPIHandler & BundleSubmissionResponse**  
  Prepare and submit FHIR bundles containing uploaded documents.


### ⚙️ Load App Settings Configuration

Before interacting with the FHIR APIs, you need to load the application settings. This includes reading environment variables and initializing configuration.

```ts
import * as dotenv from 'dotenv';
import { AppSettingsLoader } from './common/config/AppSettingsLoader';
import { AppSettings } from './common/config/models/AppSettings';

// Load environment variables from .env file
dotenv.config();

// Function to load app settings
async function getSettings(): Promise<AppSettings> {
    return AppSettingsLoader.load();
}

// Load settings
const settings = await getSettings();

// Assign CLIENT_ID and CLIENT_SECRET from environment variables
if (process.env.CLIENT_SECRET && process.env.CLIENT_ID) {
    settings.AuthenticationAPI.ClientId = process.env.CLIENT_ID;
    settings.AuthenticationAPI.ClientSecret = process.env.CLIENT_SECRET;
}

```
💡 **Explanation**
  
- `dotenv.config()`  
Loads environment variables from your `.env` file so they can be used in the application.  
  
- `AppSettingsLoader.load()`  
Retrieves the application configuration, including API endpoints, timeouts, and other settings.  
  
- `CLIENT_ID` and `CLIENT_SECRET`  
Are applied to the authentication API settings, enabling secure access to FHIR API requests.


### 🔑 Authentication API Token Module

To access FHIR APIs, you need to obtain an authentication token. First, ensure the app settings are loaded, then call the following method:

```ts
import { AuthenticationAPIHandler } from './authentication-api/AuthenticationAPIHandler';
import { AppSettings } from './common/config/models/AppSettings';
import { Token } from './authentication-api/models/Token';
import { CommonFailedResponse } from './common/models/CommonFailedResponse';

// Function to get token
async function getToken(appSettings: AppSettings): Promise<Token | CommonFailedResponse> {
    const tokenHandler = new AuthenticationAPIHandler(appSettings = appSettings);
    return await tokenHandler.getToken();
}

// Example usage
const tokenResult = await getToken(settings);

if (tokenResult && 'access_token' in tokenResult) {
    console.log(`Access Token: ${tokenResult.access_token}`);
    // Proceed with API requests using tokenResult.access_token
} else {
    console.warn('Failed to obtain token!');
}

```

💡 **Explanation**
  
- **`AuthenticationAPIHandler`**  
Handles communication with the authentication endpoint.  
  
- **`getToken()`**  
Returns a `Token` object if successful, or `CommonFailedResponse` if the request fails.  
  
- **Returned Token**  
The obtained token is used for **all subsequent API requests** to authenticate your client.


### 🔗 Pre-signed URL API Module

Before performing a bundle submission, you must generate pre-signed URLs. These URLs allow secure uploads to the server without exposing credentials. Use your loaded app settings and authentication token as shown below:

```ts
import { PresignedURLAPIHandler } from './bundle-submission-api/PresignedURLAPIHandler';
import { AppSettings } from './common/config/models/AppSettings';
import { PresignedURLInfo } from './bundle-submission-api/models/PresignedURLInfo';
import { PresignedURLResponse } from './bundle-submission-api/models/PresignedURLResponse';

// Function to get pre-signed URLs
async function getPresignedURLAsync(appSettings: AppSettings, token: string, guid: string): Promise<PresignedURLInfo[]> {
    const presignedURLHandler = new PresignedURLAPIHandler(appSettings = appSettings, token = token);
    const response = await presignedURLHandler.getPresignedURLAsync(guid) as PresignedURLResponse;
    return await presignedURLHandler.processPresignedURLResponse(response);
}

// Example usage
const presignedURLDataList = await getPresignedURLAsync(settings, tokenValue, sharedGuidId);

```
💡 **Explanation**
  
- **`PresignedURLAPIHandler`**  
Handles requests to generate pre-signed URLs for secure document uploads.  
  
- **`getPresignedURLAsync()`**  
Returns an array of `PresignedURLInfo` objects containing URLs and metadata for uploading documents.  
  
- **Usage**  
The generated pre-signed URLs are used in subsequent calls to upload clinical documents securely, without exposing authentication credentials directly.


### 📤 Upload Clinical Document API Module

This module demonstrates how to **upload a clinical document** using a presigned URL and then submit a FHIR bundle.

```ts

const  sharedGuidId  =  GuidGenerator.generate();

// Upload a clinical document using the API handler
async function uploadClinicalDocumentAsync(
    appSettings: AppSettings,
    token: string,
    presignedURL: string,
    fileName: string
): Promise<UploadClinicalDocumentResponse | CommonFailedResponse> {
    const clinicalDocumentUploadHandler = new ClnicalDocumentUploadAPIHandler(appSettings = appSettings, token = token);
    return await clinicalDocumentUploadHandler.uploadClinicalDocumentAsync(presignedURL, fileName);
}

// Example usage with multiple presigned URLs
if (presignedURLDataList && presignedURLDataList.length > 0) {
    for (const presignedURL of presignedURLDataList) {
        if (presignedURL.partValueUrl?.valueUrl && presignedURL.partValueString?.valueString) {
            logger.info(`Processing Clinical Document Upload with Presigned URL: ${presignedURL.partValueUrl.valueUrl}`);

            const uploadClinicalDocumentResponse = await uploadClinicalDocumentAsync(
                settings,
                tokenValue,
                presignedURL.partValueUrl.valueUrl,
                presignedURL.partValueString.valueString
            );

        }
    }
}

```

💡 **Explanation**
  
- **`uploadClinicalDocumentAsync()`**  
Wrapper function to upload a clinical document using a pre-signed URL.  
  
- **Iterates over `presignedURLDataList`**  
Handles multiple documents in case more than one URL is generated.  
  
- **Validation**  
Checks if `valueUrl` and `valueString` exist before processing each upload.  



### 📦 Bundle Submission API Module

To submit a bundle after uploading clinical documents, use the following example:

```ts
import { BundleSubmissionAPIHandler } from './bundle-submission-api/BundleSubmissionAPIHandler';
import { AppSettings } from './common/config/models/AppSettings';
import { UploadClinicalDocumentResponse } from './bundle-submission-api/models/UploadClinicalDocumentResponse';
import { BundleSubmissionResponse } from './bundle-submission-api/models/BundleSubmissionResponse';
import { CommonFailedResponse } from './common/models/CommonFailedResponse';

// Function to process bundle submission
async function processBundleSubmissionRequestAsync(
    appSettings: AppSettings,
    token: string,
    uploadClinicalDocumentSuccessResponse: UploadClinicalDocumentResponse,
    guid: string
): Promise<BundleSubmissionResponse | CommonFailedResponse> {

    const bundleSubmissionHandler = new BundleSubmissionAPIHandler(appSettings = appSettings, token = token);

    // Prepare the request with the uploaded document info
    await bundleSubmissionHandler.prepareBundleSubmissionRequest(uploadClinicalDocumentSuccessResponse, guid);

    // Submit the bundle
    return await bundleSubmissionHandler.processBundleSubmissionRequestAsync(guid);
}

// Example usage after uploading clinical documents
if (presignedURLDataList && presignedURLDataList.length > 0) {
    for (const presignedURL of presignedURLDataList) {
        if (presignedURL.partValueUrl?.valueUrl && presignedURL.partValueString?.valueString) {
            logger.info('Processing Bundle Submission Request!');
            const bundleSubmissionResponse = await processBundleSubmissionRequestAsync(
                settings,
                tokenValue,
                uploadClinicalDocumentResponse as UploadClinicalDocumentResponse,
                sharedGuidId
            );
        }
    }
}

```

💡 **Explanation**
  
- **`BundleSubmissionAPIHandler`**  
Handles the preparation and submission of a FHIR bundle to the server.  
  
- **`processBundleSubmissionRequestAsync()`**  
Prepares the bundle using uploaded clinical documents and submits it.  
  
- **Iterates over `presignedURLDataList`**  
Ensures that each uploaded document is included in the bundle submission.  
  
- **Logging**  
Tracks each processing step and confirms bundle submission success.



### ✅ Delivery Confirmation API Module

After submitting a bundle, you can confirm delivery using the following example:

```ts
import { DeliveryConfirmationAPIHandler } from './document-retrieval-api/DeliveryConfirmationAPIHandler';
import { AppSettings } from './common/config/models/AppSettings';
import { DeliveryConfirmationResponse } from './document-retrieval-api/models/DeliveryConfirmationResponse';
import { CommonFailedResponse } from './common/models/CommonFailedResponse';
import { GuidGenerator } from './common/utils/GuidGenerator';

// Function to process delivery confirmation
async function processDeliveryConfirmationAsync(
    appSettings: AppSettings,
    token: string
): Promise<DeliveryConfirmationResponse | CommonFailedResponse> {

    // Generate a unique request ID
    appSettings.DeliveryConfirmationAPI.Request.id = GuidGenerator.generate();

    // Create handler and process delivery confirmation
    const deliveryConfirmationHandler = new DeliveryConfirmationAPIHandler(appSettings = appSettings, token = token);
    return await deliveryConfirmationHandler.processDeliveryConfirmationAsync();
}

// Example usage
logger.info('Processing Delivery Confirmation!');
const deliveryConfirmationResponse = await processDeliveryConfirmationAsync(settings, tokenValue);

```

💡 **Explanation**

- **`DeliveryConfirmationAPIHandler`**  
Handles requests to confirm that a submitted bundle has been received by the server.  
  
- **`processDeliveryConfirmationAsync()`**  
Sends the delivery confirmation request and returns a `DeliveryConfirmationResponse` or `CommonFailedResponse`.  
  
- **`GuidGenerator.generate()`**  
Generates a unique ID for each request to ensure traceability.  
  
- **Logging**  
Tracks the delivery confirmation process and provides feedback on success or failure.


### 🔔 Notification Processing API Module

This module demonstrates how to **retrieve notifications** from the server using the Notification API.

```ts
async function getNotificationsAsync(
    appSettings: AppSettings,
    token: string
): Promise<NotificationResponse | CommonFailedResponse> {

    // Generate a unique request ID for traceability
    appSettings.DeliveryConfirmationAPI.Request.id = GuidGenerator.generate();

    const notificationHandler = new NotificationAPIHander(appSettings = appSettings, token = token);
    return await notificationHandler.getNotificationsAsync();
}

// Example usage
logger.info('Processing Notification Retrievals!');
const notificationRetrievalResponse = await getNotificationsAsync(settings, tokenValue);

```

💡 **Explanation**
  
- **`getNotificationsAsync()`**  
Wrapper function to fetch notifications from the server.  
  
- **Guid Generation**  
Uses `GuidGenerator.generate()` to assign a unique ID to each request for tracking.  
  
- **NotificationAPIHander**  
Handles the request and returns a `NotificationResponse` or `CommonFailedResponse`.  
  
- **Logging**  
Tracks the notification retrieval process and logs the result for debugging or audit purposes.

### Practitioner API Module

```ts
async function processPractitionerRequestAsync(
    appSettings: AppSettings,
    token: string,
    practitionerId?: string
): Promise<PractitionerResponse | CommonFailedResponse> {

    const practitionerHandler = new PractitionerAPIHandler(appSettings = appSettings, token = token);
    return await practitionerHandler.processPractitionerRequestAsync(practitionerId);
}

logger.info('Processing Practitioner Request!');

const practitionerResponse = await processPractitionerRequestAsync(settings, tokenValue);

```

💡 **Explanation**

- **`processPractitionerRequestAsync()`**  
  Wrapper function to fetch practitioner data from the server.

- **`PractitionerAPIHandler`**  
  Handles communication with the Practitioner API and returns a `PractitionerResponse` if successful, or `CommonFailedResponse` if the request fails.

- **Optional `practitionerId`**  
  Can be provided to retrieve data for a specific practitioner.

- **Logging**  
  Tracks the practitioner request process and logs the outcome for debugging or auditing purposes.



### Binary File API Module

```ts
async function getBinaryFileDataAsync(
    appSettings: AppSettings,
    token: string,
    fileNameIDValue?: string
): Promise<BinaryClientResponse | CommonFailedResponse> {

    const binaryHandler = new BinaryClientAPIHandler(appSettings = appSettings, token = token);
    return await binaryHandler.getBinaryFileDataAsync(fileNameIDValue);
}

logger.info('Processing Binary Client data!');

const binaryClientResponse = await getBinaryFileDataAsync(settings, tokenValue);

```

💡 **Explanation**
  
- **`getBinaryFileDataAsync()`**  
Wrapper function to fetch binary file data from the server.  
  
- **`BinaryClientAPIHandler`**  
Handles the request and returns either a `BinaryClientResponse` with the file data or a `CommonFailedResponse` if the request fails.  
  
- **Optional `fileNameIDValue`**  
Can be used to fetch a specific file by its identifier.  
  
- **Logging**  
Tracks the retrieval of binary client data for debugging and audit purposes.

### Document Retrieval API Module

```ts
async function getDocumentRetrievalDataAsync(
    appSettings: AppSettings,
    token: string
): Promise<DocumentRetrievalResponse | CommonFailedResponse> {

    const documentRetrievalHandler = new DocumentRetrievalAPIHandler(appSettings = appSettings, token = token);
    return await documentRetrievalHandler.getDocumentRetrievalDataAsync();
}

logger.info('Processing Document Retrieval data!');
const documentRetrievalClientResponse = await getDocumentRetrievalDataAsync(settings, tokenValue);

```
💡 **Explanation**

- **`getDocumentRetrievalDataAsync()`**  
  Wrapper function to retrieve FHIR document data from the server.

- **`DocumentRetrievalAPIHandler`**  
  Handles the request and returns a `DocumentRetrievalResponse` if successful, or `CommonFailedResponse` if it fails.

- **Logging**  
  Tracks the document retrieval process and logs the result for debugging or auditing purposes.

- **Usage**  
  Can be used to fetch multiple documents or a specific set of FHIR resources as defined by the server configuration.



### Bundle Practitioner API Module

```ts
async function processBundlePractitionerRequestAsync(
    appSettings: AppSettings,
    token: string,
    guid?: string
): Promise<BundlePractitionerResponse | CommonFailedResponse> {

    const bundlePractitionerHandler = new BundlePractitionerAPIHandler(appSettings = appSettings, token = token);
    return await bundlePractitionerHandler.processBundlePractitionerRequestAsync(guid);
}

logger.info('Processing Bundle Practitioner Request!');
const bundlePractitionerResponse = await processBundlePractitionerRequestAsync(settings, tokenValue, sharedGuidId);

```
💡 **Explanation**

- **`processBundlePractitionerRequestAsync()`**  
  Wrapper function to request practitioner-related bundle data from the server.

- **`BundlePractitionerAPIHandler`**  
  Handles the request and returns a `BundlePractitionerResponse` if successful, or a `CommonFailedResponse` if it fails.

- **Optional `guid`**  
  Can be passed to link the request with a specific bundle or transaction for traceability.

- **Logging**  
  Tracks the bundle practitioner request process and logs the outcome for debugging or auditing purposes.


### Logging and Monitoring

```ts
	import { logger } from  './common/logger/Logger';
	logger.info('Main Started ..... Processing FHIR Client Requests!');
	logger.warn('Main Started ..... Processing FHIR Client Requests!');
	logger.debug('Main Started ..... Processing FHIR Client Requests!');
	logger.error('Main Started ..... Processing FHIR Client Requests!');
```


### Logging and Monitoring

💡 **Explanation**

- **logger**  
  The `logger` module provides structured logging for different levels of messages in the application.
  All the log files are stored under PROJECT_FOLDER/logs folder.

- **Logging Levels:**  
  - `logger.info()` – Records general informational messages about the application flow.  
  - `logger.warn()` – Highlights potential issues or warnings that need attention but are not critical.  
  - `logger.debug()` – Captures detailed debugging information useful during development or troubleshooting.  
  - `logger.error()` – Logs critical errors that may affect execution or require immediate attention.  

- **Usage**  
  Logging at multiple levels helps monitor, debug, and audit application behavior in a clear and organized manner. Different log levels can be filtered for development or production environments.
  

  

## 🏗️ Architecture

  

### Project Structure

```
esmd-fhir-client-nodejs
|   .env
|   .gitignore
|   .npmrc
|   jest.config.js
|   package-lock.json
|   package.json
|   PROJECT_STRUCTURE.txt
|   README.md
|   tsconfig.json
|   
+---logs
|       app-2025-10-10.log
|
+---src
|   |   main.ts
|   |   
|   +---authentication-api
|   |   |   AuthenticationAPIHandler.ts
|   |   |   
|   |   \---models
|   |           Token.ts
|   |           
|   +---bundle-submission-api
|   |   |   BundlePractitionerAPIHandler.ts
|   |   |   BundleSubmissionAPIHandler.ts
|   |   |   ClnicalDocumentUploadAPIHandler.ts
|   |   |   PresignedURLAPIHandler.ts
|   |   |   
|   |   \---models
|   |           BundlePractitionerResponse.ts
|   |           BundleSubmissionResponse.ts
|   |           PresignedURLInfo.ts
|   |           PresignedURLResponse.ts
|   |           UploadClinicalDocumentResponse.ts
|   |           
|   +---common
|   |   +---client
|   |   |   |   HttpAxiosClient.ts
|   |   |   |   
|   |   |   \---models
|   |   |           ClientResponse.ts
|   |   |           
|   |   +---config
|   |   |   |   appsettings.json
|   |   |   |   AppSettingsLoader.ts
|   |   |   |   
|   |   |   \---models
|   |   |       |   AppSettings.ts
|   |   |       |   ParsedUrl.ts
|   |   |       |   
|   |   |       \---APIs
|   |   |               AuthenticationAPI.ts
|   |   |               BinaryAPI.ts
|   |   |               BundlePractitionerAPI.ts
|   |   |               BundleSubmissionAPI.ts
|   |   |               DeliveryConfirmationAPI.ts
|   |   |               DocumentRetrievalAPI.ts
|   |   |               NotificationRetrievalAPI.ts
|   |   |               PractitionerAPI.ts
|   |   |               PresignedURLAPI.ts
|   |   |               UploadClinicalDocumentAPI.ts
|   |   |               
|   |   +---logger
|   |   |       Logger.ts
|   |   |       
|   |   +---models
|   |   |       CommonFailedResponse.ts
|   |   |       
|   |   +---type
|   |   |       types.ts
|   |   |       
|   |   \---utils
|   |           CryptoUtils.ts
|   |           DataFileWriterUtils.ts
|   |           DateTimeUtil.ts
|   |           FileUtils.ts
|   |           GuidGenerator.ts
|   |           HttpResponseUtils.ts
|   |           RequestTransformerUtil.ts
|   |           TokenUtils.ts
|   |           URLUtils.ts
|   |           VariableResolver.ts
|   |           
|   +---document-retrieval-api
|   |   |   BinaryClientAPIHandler.ts
|   |   |   DeliveryConfirmationAPIHandler.ts
|   |   |   DocumentRetrievalAPIHandler.ts
|   |   |   
|   |   \---models
|   |           BinaryClientResponse.ts
|   |           DeliveryConfirmationResponse.ts
|   |           DocumentRetrievalResponse.ts
|   |           
|   +---notification-retrieval-api
|   |   |   NotificationAPIHander.ts
|   |   |   
|   |   \---models
|   |           NotificationResponse.ts
|   |           
|   \---practitioner-api
|       |   PractitionerAPIHandler.ts
|       |   
|       \---models
|               PractitionerResponse.ts
|               
\---tests
        AuthenticationAPIHandler.test.ts
        BinaryClientAPIHandler.test.ts
        BundlePractitionerAPIHandler.test.ts
        BundleSubmissionAPIHandler.test.ts
        ClinicalDocumentUploadAPIHander.test.ts
        DeliveryConfirmationAPIHandler.test.ts
        DocumentRetrievalAPIHandler.test.ts
        NotificationAPIHandler.test.ts
        PresignedURLAPIHandler.test.ts
        

```

  

## 🧪 Building and Tests

  

### Package JSON Scripts for build and tests

```bash

### 📦 NPM Scripts for Testing and Running the Application

This project provides several npm scripts to help with development, testing, and production builds.

```json
"scripts": {
  "test": "jest --passWithNoTests",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "build": "tsc",
  "start": "ts-node src/main.ts",
  "start:prod": "npm run build && node dist/main.js"
}
```

💡 **Explanation of NPM Scripts**

- **`test`**  
  Runs all Jest tests once. The `--passWithNoTests` flag ensures that the command does not fail if no tests are present.

- **`test:watch`**  
  Runs Jest in watch mode. Tests automatically rerun whenever relevant files are changed, which is useful during development.

- **`test:coverage`**  
  Generates a code coverage report for all tests using Jest. Helps identify untested parts of the codebase.

- **`build`**  
  Compiles TypeScript files into JavaScript using the TypeScript compiler (`tsc`). Outputs are usually placed in the `dist` folder.

- **`start`**  
  Runs the application using `ts-node` directly from TypeScript source files. Useful for development without building the project.

- **`start:prod`**  
  Builds the TypeScript project and then runs the compiled JavaScript from the `dist` folder. Recommended for production environments.

### NPM Scripts and Commands

The following commands can be run from your shell to manage the project:

```bash
# Run all Jest tests once (does not fail if no tests exist)
npm run test

# Run Jest in watch mode (re-runs tests on file changes)
npm run test:watch

# Generate a Jest code coverage report
npm run test:coverage

# Compile TypeScript files into JavaScript
npm run build

# Run the application directly using ts-node (development)
npm run start

# Build the project and run compiled JavaScript (production)
npm run start:prod
  
```

  

## 🔐 Security



### Authentication Security

The library implements secure authentication using the following features:

- **OAuth2 Client Credentials Flow**  
  Ensures secure server-to-server authentication.

- **Automatic Token Refresh**  
  Tokens are automatically refreshed before expiration to maintain seamless access.

- **Secure Token Storage**  
  Tokens are stored **in memory only**, reducing the risk of persistent storage leaks.



### Development Workflow

Follow these steps to contribute to the project:

1. **Fork the repository**  
   Create your own copy of the repository under your GitHub account.

2. **Create a feature branch**  
   Use a descriptive branch name, e.g., `feature/add-auth-module`.

3. **Make your changes with tests**  
   Implement the feature or fix, and include corresponding unit tests.

4. **Ensure all quality checks pass**  
   Run linting, formatting, and tests to verify your changes.

5. **Submit a pull request**  
   Open a PR from your feature branch to the main repository, describing the changes and referencing any related issues.

  


### Code Review Checklist

Ensure the following before merging any code:

1. **Code follows style guidelines**  
   Maintain consistent formatting, naming conventions, and project style.

2. **All tests pass**  
   Unit, integration, and end-to-end tests should succeed.

3. **Type hints are present**  
   All functions, variables, and parameters should have proper TypeScript types.

4. **Documentation is updated**  
   README, inline comments, and API docs reflect the new changes.

5. **Error handling is comprehensive**  
   All potential errors are properly caught and handled.

6. **Performance impact is considered**  
   Changes should not introduce significant performance regressions.

  

**esmd-fhir-client-nodejs** - Production-ready FHIR client with enterprise-grade reliability and performance.