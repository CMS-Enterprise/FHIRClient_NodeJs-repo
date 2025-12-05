import * as fs from 'fs';
import * as path from 'path';

export class FileUtils {
    /**
     * Builds the full file path from a folder and filename.
     */
    static getFullFilePath({
        folder,
        fileName,
    }: {
        folder: string;
        fileName: string;
    }): string {
        if (!folder || !fileName) {
            throw new Error('Folder and fileName are required.');
        }
        return path.resolve(folder, fileName);
    }

    static getFileSizeBytes(filePath: string): number {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const stats = fs.statSync(filePath);
        return stats.size;
    }

    /**
     * Gets the file size in MB (rounded to two decimals).
     */
    static getFileSizeInMB(filePath: string): number {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const stats = fs.statSync(filePath);
        const bytes = stats.size;
        return Math.round((bytes / (1024 * 1024)) * 100) / 100;
    }
}
