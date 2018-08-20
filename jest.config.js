module.exports = {
    "moduleFileExtensions": [
        "ts",
        "js"
    ],
    "transform": {
        "^.+\\.ts$": "<rootDir>/node_modules/ts-jest/preprocessor.js"
    },
    "timers": "fake",
    "mapCoverage": true,
    "testMatch": [
        "<rootDir>/tests/**/*.(ts|js)"
    ]
}