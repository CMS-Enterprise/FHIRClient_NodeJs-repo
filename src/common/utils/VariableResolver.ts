export function resolveEnvVariables(obj: any, parent?: any): any {
    if (typeof obj === 'string') {
        return obj.replace(/\$\{([^}]+)\}/g, (_, key) => {
            return getValueByPath(parent || obj, key) || '';
        });
    } else if (Array.isArray(obj)) {
        return obj.map((item) => resolveEnvVariables(item, parent || obj));
    } else if (typeof obj === 'object' && obj !== null) {
        const resolved: any = {};
        for (const [key, value] of Object.entries(obj)) {
            resolved[key] = resolveEnvVariables(value, parent || obj);
        }
        return resolved;
    }
    return obj;
}

function getValueByPath(obj: any, path: string): any {
    const segments = path.split('.');
    return segments.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), obj);
}
