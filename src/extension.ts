import * as vscode from 'vscode';
import * as path from 'path';
import { ChildProcess, spawn } from 'child_process';
import * as fs from 'fs';

let currentProcess: ChildProcess | null = null;
let watchers: { dispose: () => void } | null = null;
let outputChannel: vscode.OutputChannel | null = null;
let currentFile: string | null = null;

export function activate(context: vscode.ExtensionContext) {
    outputChannel = vscode.window.createOutputChannel('JS/TS Live');

    const startCommand = vscode.commands.registerCommand('run-js-ts.start', () => {
        const editor = vscode.window.activeTextEditor;
        
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const document = editor.document;
        const isTypeScript = (document.languageId === 'typescript' || document.languageId === 'typescriptreact') && 
                            (document.fileName.endsWith('.ts') || document.fileName.endsWith('.tsx'));
        const isJavaScript = document.languageId === 'javascript' && document.fileName.endsWith('.js');
        
        if (!isTypeScript && !isJavaScript) {
            vscode.window.showErrorMessage('Active file is not a JavaScript, TypeScript, or TSX file');
            return;
        }

        if (document.isUntitled) {
            vscode.window.showErrorMessage('Please save the file first');
            return;
        }

        currentFile = document.fileName;
        startTypeScriptProcess(context);
        setupFileWatcher(context);
        
        vscode.window.showInformationMessage(`JS/TS Live started for ${path.basename(currentFile)}`);
    });

    const stopCommand = vscode.commands.registerCommand('run-js-ts.stop', () => {
        stopTypeScriptProcess();
        vscode.window.showInformationMessage('JS/TS Live stopped');
    });

    const runFileCommand = vscode.commands.registerCommand('run-js-ts.runFile', (uri: vscode.Uri) => {
        if (!uri || !uri.fsPath) {
            vscode.window.showErrorMessage('No file selected');
            return;
        }

        const filePath = uri.fsPath;
        const isTypeScript = filePath.endsWith('.ts') || filePath.endsWith('.tsx');
        const isJavaScript = filePath.endsWith('.js');
        
        if (!isTypeScript && !isJavaScript) {
            vscode.window.showErrorMessage('Selected file is not a JavaScript, TypeScript, or TSX file');
            return;
        }

        currentFile = filePath;
        startTypeScriptProcess(context);
        setupFileWatcher(context);
        
        vscode.window.showInformationMessage(`JS/TS Live started for ${path.basename(currentFile)}`);
    });

    context.subscriptions.push(startCommand, stopCommand, runFileCommand);
}

function startTypeScriptProcess(context: vscode.ExtensionContext) {
    if (!currentFile) return;

    stopTypeScriptProcess();

    outputChannel!.clear();
    outputChannel!.show();
    outputChannel!.appendLine(`Starting ${path.basename(currentFile)}...\n`);

    try {
        // Find tsx CLI in node_modules
        const extensionPath = context.extensionPath;
        const tsxCliPath = path.join(extensionPath, 'node_modules', 'tsx', 'dist', 'cli.js');
        
        if (!fs.existsSync(tsxCliPath)) {
            throw new Error('tsx CLI not found in extension dependencies');
        }
        
        currentProcess = spawn(process.execPath, [tsxCliPath, currentFile], {
            cwd: path.dirname(currentFile),
            stdio: ['ignore', 'pipe', 'pipe']
        });
    } catch (error: any) {
        outputChannel!.appendLine(`Error resolving tsx: ${error}`);
        vscode.window.showErrorMessage('tsx not found. Please install tsx dependency.');
        return;
    }

    currentProcess.stdout?.on('data', (data: Buffer) => {
        outputChannel!.append(data.toString());
    });

    currentProcess.stderr?.on('data', (data: Buffer) => {
        outputChannel!.append(data.toString());
    });

    currentProcess.on('close', (code: number | null) => {
        if (code !== null) {
            outputChannel!.appendLine(`\nProcess exited with code ${code}`);
        }
    });

    currentProcess.on('error', (error: Error) => {
        outputChannel!.appendLine(`\nError: ${error.message}`);
        vscode.window.showErrorMessage(`Failed to start JS/TS Live: ${error.message}`);
    });
}

function stopTypeScriptProcess() {
    if (currentProcess) {
        currentProcess.kill();
        currentProcess = null;
        outputChannel!.appendLine('\nProcess stopped\n');
    }

    if (watchers) {
        watchers.dispose();
        watchers = null;
    }
}

function setupFileWatcher(context: vscode.ExtensionContext) {
    if (!currentFile) return;

    const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(currentFile));
    if (!workspaceFolder) return;

    // Watch JavaScript, TypeScript, and TSX files in the workspace
    const tsPattern = new vscode.RelativePattern(workspaceFolder, '**/*.ts');
    const tsxPattern = new vscode.RelativePattern(workspaceFolder, '**/*.tsx');
    const jsPattern = new vscode.RelativePattern(workspaceFolder, '**/*.js');
    
    const tsWatcher = vscode.workspace.createFileSystemWatcher(tsPattern);
    const tsxWatcher = vscode.workspace.createFileSystemWatcher(tsxPattern);
    const jsWatcher = vscode.workspace.createFileSystemWatcher(jsPattern);

    const restartProcess = (uri: vscode.Uri) => {
        outputChannel!.appendLine(`\nFile changed: ${path.basename(uri.fsPath)}`);
        outputChannel!.appendLine('Restarting...\n');
        
        setTimeout(() => {
            startTypeScriptProcess(context);
        }, 100); // Small delay to ensure file write is complete
    };

    // Set up watchers for all file types
    tsWatcher.onDidChange(restartProcess);
    tsWatcher.onDidCreate(restartProcess);
    tsWatcher.onDidDelete(restartProcess);
    
    tsxWatcher.onDidChange(restartProcess);
    tsxWatcher.onDidCreate(restartProcess);
    tsxWatcher.onDidDelete(restartProcess);
    
    jsWatcher.onDidChange(restartProcess);
    jsWatcher.onDidCreate(restartProcess);
    jsWatcher.onDidDelete(restartProcess);
    
    // Store watchers for cleanup
    watchers = {
        dispose: () => {
            tsWatcher.dispose();
            tsxWatcher.dispose();
            jsWatcher.dispose();
        }
    };
}

export function deactivate() {
    stopTypeScriptProcess();
    
    if (outputChannel) {
        outputChannel.dispose();
    }
}