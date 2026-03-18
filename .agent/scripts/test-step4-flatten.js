const fs = require('fs');
const { flattenToDottedKeys, normalizeFormData, normalizeServerFormData } = require('./draft-test.js');

const rawWatch = {
    "step4": {
        "persons": [
            {
                "first_name": "John",
                "is_us_person": true,
                "is_shareholder": false,
                "is_ubo": false
            }
        ]
    }
};

const flat = flattenToDottedKeys(rawWatch);
const serverNormalized = normalizeServerFormData(flat);

const dbRow = {
    form_data: {
        ...serverNormalized
    }
};

const hydrated = normalizeFormData(dbRow.form_data);

const keysAfterFilter = Object.keys(hydrated)
    .filter(key => key.startsWith('step4.'))
    .reduce((acc, key) => {
        acc[key] = hydrated[key];
        return acc;
    }, {});

const result = {
    flat,
    serverNormalized,
    hydrated,
    keysAfterFilter
};

fs.writeFileSync(__dirname + '/test-results-step4.json', JSON.stringify(result, null, 2));
