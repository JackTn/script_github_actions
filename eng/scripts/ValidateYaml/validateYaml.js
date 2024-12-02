const Ajv = require("ajv");
const fs = require('fs');

const ajv = new Ajv();

const sdkLabels = {
    "azure-sdk-for-go": {
        breakingChange: "BreakingChange-Go-Sdk",
        breakingChangeApproved: "BreakingChange-Go-Sdk-Approved",
        breakingChangeSuppression: "BreakingChange-Go-Sdk-Suppression",
        breakingChangeSuppressionApproved: "BreakingChange-Go-Sdk-Suppression-Approved",
    },
    "azure-sdk-for-java": {
        breakingChange: "BreakingChange-Java-Sdk",
        breakingChangeApproved: "BreakingChange-Java-Sdk-Approved",
        breakingChangeSuppression: "BreakingChange-Java-Sdk-Suppression",
        breakingChangeSuppressionApproved: "BreakingChange-Java-Sdk-Suppression-Approved",
    },
    "azure-sdk-for-js": {
        breakingChange: "BreakingChange-JavaScript-Sdk",
        breakingChangeApproved: "BreakingChange-JavaScript-Sdk-Approved",
        breakingChangeSuppression: "BreakingChange-JavaScript-Sdk-Suppression",
        breakingChangeSuppressionApproved: "BreakingChange-JavaScript-Sdk-Suppression-Approved",
    },
    "azure-sdk-for-net": {
        breakingChange: undefined,
        breakingChangeApproved: undefined,
        breakingChangeSuppression: undefined,
        breakingChangeSuppressionApproved: undefined,
    },
    "azure-sdk-for-python": {
        breakingChange: "BreakingChange-Python-Sdk",
        breakingChangeApproved: "BreakingChange-Python-Sdk-Approved",
        breakingChangeSuppression: "BreakingChange-Python-Sdk-Suppression",
        breakingChangeSuppressionApproved: "BreakingChange-Python-Sdk-Suppression-Approved",
    }
};

const schema = {
    type: 'object',
    properties: {
        suppressions: {
            type: 'object',
            propertyNames: {
                enum: Object.keys(sdkLabels)
            },
            patternProperties: {
                "^.*$": {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            package: { type: 'string' },
                            "breaking-changes": { type: 'array', items: { type: 'string' } }
                        },
                        required: ['package', 'breaking-changes'],
                        additionalProperties: false
                    }
                }
            }
        }
    },
    required: ['suppressions'],
    additionalProperties: false
};

function validateFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.error(`Error: ${filePath} does not exist.`);
        process.exit(1);
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const validate = ajv.compile(schema);
    const valid = validate(JSON.parse(content));
    if (!valid) {
        console.error(`Error: Validation failed for ${filePath}, Error: ${JSON.stringify(validate.errors)}`);
        process.exit(1);
    }

    console.log(`${filePath} is valid.`);
}

const filePath = process.argv[2];
console.log(`Validating ${filePath}...`);

if (!filePath) {
    console.error('Error: No file path provided.');
    process.exit(1);
}

validateFile(filePath);