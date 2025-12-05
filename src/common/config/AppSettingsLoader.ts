import fs from 'fs';
import path from 'path';
import { AppSettings } from './models/AppSettings';
import { resolveEnvVariables } from '../utils/VariableResolver';

export class AppSettingsLoader {
    static load(): AppSettings {

        const configPath = path.resolve(__dirname, 'appsettings.json');
        let rawData = fs.readFileSync(configPath, 'utf-8');
        let parsedData = JSON.parse(rawData);

        
        let updatedRawData =  rawData.replace(/\$\{FHIRServerUrl\}/g, parsedData.AppSettings.FHIRServerUrl)
        updatedRawData = updatedRawData.replace(/\$\{EndPointBaseUrl\}/g, parsedData.AppSettings.EndPointBaseUrl);
        const resolved = JSON.parse(updatedRawData);
        return resolved.AppSettings as AppSettings;
       

        // Handle variable interpolation like ${EndPointBaseUrl}  - Giving issues so don't use it. replaced by above code.
        //const resolved = resolveEnvVariables(parsedData.AppSettings);
        //  return resolved as AppSettings;

       
    }
}
