"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const vscode = require("vscode");
const myExtension = require("../extension");
suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');
    test('Sample test', () => {
        assert.strictEqual(1 + 1, 2, 'Basic arithmetic should work');
    });
    test('Extension activation', () => {
        assert.ok(myExtension, 'Extension module should be defined');
    });
});
//# sourceMappingURL=extension.test.js.map