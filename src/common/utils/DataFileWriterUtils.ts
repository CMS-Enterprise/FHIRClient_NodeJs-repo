import * as fs from 'fs';
import * as path from 'path';
import { logger } from "../logger/Logger";

export class DataFileWriterUtils {
  private baseFolder: string;

  constructor(baseFolder: string) {
    this.baseFolder = baseFolder;
  }

  /**
   * Creates a subfolder and writes JSON data to a file inside it.
   * Accepts either an object/array or a pre-formatted JSON string.
   * @param subFolder - Subdirectory name
   * @param fileName - File name (without .json)
   * @param data - JavaScript object/array or JSON string
   */
  public async writeJson(
    subFolder: string,
    fileName: string,
    data: object | string
  ): Promise<boolean> {

    const fullPath = path.join(this.baseFolder, subFolder);

    await fs.promises.mkdir(fullPath, { recursive: true });

    const filePath = path.join(fullPath, `${fileName}.json`);
    let jsonData: string;

    if (typeof data === 'string') {
      try {
        JSON.parse(data); // Validate JSON
        jsonData = data;
      } catch (err) {
        logger.error(`Provided string is not valid JSON: ${err}`);
        return false;
      }
    } else if (typeof data === 'object') {
      jsonData = JSON.stringify(data);
    } else {
      logger.error('Data must be an object, array, or valid JSON string.');
      return false;
    }

    await fs.promises.writeFile(filePath, jsonData, 'utf-8');
    logger.info(`JSON file created at: ${filePath}`);
    return true;
  }

  /**
   * Creates a subfolder and writes plain text to a .txt file inside it.
   * @param subFolder - Subdirectory name
   * @param fileName - File name (without .txt)
   * @param text - Plain text to write
   */
  public async writeText(
    subFolder: string,
    fileName: string,
    text: string
  ): Promise<void> {

    const fullPath = path.join(this.baseFolder, subFolder);

    await fs.promises.mkdir(fullPath, { recursive: true });

    const filePath = path.join(fullPath, `${fileName}.txt`);

    await fs.promises.writeFile(filePath, text, 'utf-8');

    logger.info(`Text file created at: ${filePath}`);
  }
}
