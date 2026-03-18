const fs = require('fs');
const { flattenToDottedKeys, normalizeFormData, normalizeServerFormData } = require('./draft-test.js');

const rawWatch = {
    "step2": {
        "suppliers": [
            { "name": "Apple", "country": "US", "url": "apple.com" },
            { "name": "Google", "country": "US", "url": "google.com" }
        ],
        "stock_locations": [
            { "country": "UK", "city": "London", "postal": "123", "street": "Baker" }
        ],
        "has_own_stock": true
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

const result = {
    flat,
    serverNormalized,
    hydrated
};

fs.writeFileSync(__dirname + '/test-results.json', JSON.stringify(result, null, 2));
