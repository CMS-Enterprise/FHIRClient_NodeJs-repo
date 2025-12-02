import * as fs from 'fs';
import * as crypto from 'crypto';

export class CryptoUtils {
  /**
   * Computes the MD5 hash of a file and returns it as a Base64 string.
   */
  static computeContentMd5String(filePath: string): string {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const fileBuffer = fs.readFileSync(filePath);
    const hash = crypto.createHash('md5').update(fileBuffer).digest('base64');
    return hash;
  }
  static computeContentMd5Bytes(filePath: string): Buffer {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const fileBuffer = fs.readFileSync(filePath);
    const hash = crypto.createHash('md5').update(fileBuffer).digest();
    return hash; // Node.js Buffer = byte[]
  }

  /**
   * Converts a Base64 string into a byte array (Buffer).
   * Equivalent to C# Convert.FromBase64String().
   */
  static convertBase64StringToBytes(base64StringValue: string): Buffer {
    return Buffer.from(base64StringValue, 'base64');
  }

  /**
   * Computes the SHA-256 checksum of a file and returns it as a lowercase hexadecimal string.
   * Equivalent to the C# method that uses BitConverter.ToString() + Replace("-", "").
   */
  static computeSHA256Checksum(filePath: string): string {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const fileBuffer = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    return hash.toLowerCase(); // same as .ToLowerInvariant() in C#
  }
}
