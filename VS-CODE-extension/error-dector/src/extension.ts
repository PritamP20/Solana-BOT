import * as vscode from 'vscode';
import axios from 'axios';

export function activate(context: vscode.ExtensionContext) {
  console.log('Error Assistant extension is now active');

  const checkCurrentFileCommand = vscode.commands.registerCommand('errorAssistant.checkCurrentFile', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active file to check.');
      return;
    }

    const uri = editor.document.uri;
    const diagnostics = vscode.languages.getDiagnostics(uri).filter(
      (diag) => diag.severity === vscode.DiagnosticSeverity.Error
    );

    if (diagnostics.length === 0) {
      vscode.window.showInformationMessage('No errors found in the current file.');
      return;
    }

    const fileContent = editor.document.getText();
    const errorDetails = diagnostics
      .map((diag) => `Error: ${diag.message} at line ${diag.range.start.line + 1}`)
      .join('\n');

    vscode.window
      .showWarningMessage(
        `Errors detected in ${uri.fsPath}:\n${errorDetails}\nDo you want to solve them?`,
        'Yes',
        'No'
      )
      .then((selection) => {
        if (selection === 'Yes') {
          callApiWithError({
            filePath: uri.fsPath,
            fileContent,
            errors: errorDetails,
          });
        }
      });
  });

  const checkTerminalCommand = vscode.commands.registerCommand('errorAssistant.checkTerminalErrors', async () => {
    const terminal = vscode.window.activeTerminal;
    if (!terminal) {
      vscode.window.showErrorMessage('No active terminal to check.');
      return;
    }

    const errorDetails = `Potential error in terminal: ${terminal.name}\nCheck recent output for errors (e.g., npm ERR!, SyntaxError).`;
    vscode.window
      .showWarningMessage(
        `${errorDetails}\nDo you want to solve it?`,
        'Yes',
        'No'
      )
      .then((selection) => {
        if (selection === 'Yes') {
          callApiWithError({
            filePath: 'Terminal',
            fileContent: '',
            errors: errorDetails,
          });
        }
      });
  });

  const onSaveListener = vscode.workspace.onDidSaveTextDocument((document) => {
    let command = '';
    if (document.languageId === 'typescript') {
      command = `tsc ${document.fileName}`;
    } else if (document.languageId === 'python') {
      command = `python ${document.fileName}`;
    } else if (document.languageId === 'javascript') {
      command = `node ${document.fileName}`;
    }

    if (command) {
      const terminal = vscode.window.activeTerminal || vscode.window.createTerminal('Error Assistant');
      terminal.show();
      terminal.sendText(command);

      // Simulate error detection after command execution
      setTimeout(() => {
        const errorDetails = `Potential error in terminal after running: ${command}\nCheck output for errors (e.g., npm ERR!, SyntaxError).`;
        vscode.window
          .showWarningMessage(
            `${errorDetails}\nDo you want to solve it?`,
            'Yes',
            'No'
          )
          .then((selection) => {
            if (selection === 'Yes') {
              callApiWithError({
                filePath: 'Terminal',
                fileContent: document.getText(),
                errors: errorDetails,
              });
            }
          });
      }, 2000); // Delay to allow command execution
    }
  });

  const diagnosticListener = vscode.languages.onDidChangeDiagnostics((event) => {
    const diagnostics = event.uris
      .map((uri) => ({
        uri,
        diagnostics: vscode.languages.getDiagnostics(uri).filter(
          (diag) => diag.severity === vscode.DiagnosticSeverity.Error
        ),
      }))
      .filter((entry) => entry.diagnostics.length > 0);

    if (diagnostics.length === 0) return;

    diagnostics.forEach(async ({ uri, diagnostics }) => {
      const document = await vscode.workspace.openTextDocument(uri);
      const fileContent = document.getText();
      const errorDetails = diagnostics
        .map((diag) => `Error: ${diag.message} at line ${diag.range.start.line + 1}`)
        .join('\n');

      vscode.window
        .showWarningMessage(
          `Errors detected in ${uri.fsPath}:\n${errorDetails}\nDo you want to solve them?`,
          'Yes',
          'No'
        )
        .then((selection) => {
          if (selection === 'Yes') {
            callApiWithError({
              filePath: uri.fsPath,
              fileContent,
              errors: errorDetails,
            });
          }
        });
    });
  });

  context.subscriptions.push(checkCurrentFileCommand, checkTerminalCommand, onSaveListener, diagnosticListener);
}

async function callApiWithError(errorData: {
  filePath: string;
  fileContent: string;
  errors: string;
}): Promise<void> {
  const config = vscode.workspace.getConfiguration('errorAssistant');
  const apiEndpoint = config.get<string>('apiEndpoint', 'http://localhost:8082/extention');
//   const apiKey = config.get<string>('apiKey', '');

  const postData = JSON.stringify({
    filePath: errorData.filePath,
    fileContent: errorData.fileContent,
    errors: errorData.errors,
  });

  try {
    vscode.window.showInformationMessage('Calling AI error-solving API...');

    const response = await axios.post(apiEndpoint, {
		data: postData,
	})

    if (response.status >= 200 && response.status < 300) {
      interface ApiResponse {
        solution: string;
      }
      const result = response.data as ApiResponse;
      vscode.window.showInformationMessage(`Solution: ${result.solution || 'No solution provided'}`);
    } else {
      vscode.window.showErrorMessage(`API request failed with status: ${response.status}`);
    }
  } catch (err: any) {
    vscode.window.showErrorMessage(`API request error: ${err.message || 'Unknown error'}`);
  }
}

export function deactivate() {
  console.log('Error Assistant extension deactivated');
}