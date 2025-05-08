import * as assert from 'assert';
import * as vscode from 'vscode';
import * as myExtension from '../extension';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Sample test', () => {
    assert.strictEqual(1 + 1, 2, 'Basic arithmetic should work');
  });

  test('Extension activation', () => {
    assert.ok(myExtension, 'Extension module should be defined');
  });
});