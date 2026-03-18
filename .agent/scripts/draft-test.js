function flattenToDottedKeys(obj, prefix = '') {
    const result = {};

    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;

        if (value !== null && value !== undefined && typeof value === 'object' && !Array.isArray(value)) {
            Object.assign(result, flattenToDottedKeys(value, fullKey));
        } else {
            result[fullKey] = value;
        }
    }

    return result;
}

function normalizeFormData(raw) {
    const result = {};

    for (const [key, value] of Object.entries(raw)) {
        if (/^step\d+$/.test(key) && value && typeof value === 'object' && !Array.isArray(value)) {
            for (const [nestedKey, nestedValue] of Object.entries(value)) {
                const flatKey = `${key}.${nestedKey}`;
                result[flatKey] = nestedValue;
            }
        } else {
            if (!(key in result) || result[key] === '' || result[key] === undefined) {
                result[key] = value;
            }
        }
    }

    return result;
}

function normalizeServerFormData(data) {
    const clean = {};

    for (const [key, value] of Object.entries(data)) {
        if (/^step\d+$/.test(key) && value && typeof value === 'object' && !Array.isArray(value)) {
            for (const [nestedKey, nestedValue] of Object.entries(value)) {
                const flatKey = `${key}.${nestedKey}`;
                if (!(flatKey in clean) || clean[flatKey] === '' || clean[flatKey] === undefined) {
                    clean[flatKey] = nestedValue;
                }
            }
            continue;
        }
        clean[key] = value;
    }

    return clean;
}

module.exports = { flattenToDottedKeys, normalizeFormData, normalizeServerFormData };
