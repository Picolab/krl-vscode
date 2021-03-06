/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as path from 'path';
import { workspace, ExtensionContext, commands , window, TextDocument, InputBoxOptions} from 'vscode';

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient';
import { Url, parse } from 'url';
import requestPromise = require('request-promise-native');

let client: LanguageClient;

async function registerRuleset(URL : Url) {
	let currentDocument : TextDocument = window.activeTextEditor.document
	if (currentDocument.isDirty) {
		window.showWarningMessage('You haven\'t saved! Save before registering.')
		return
	}
	let ruleset : string = currentDocument.getText()

	const queryString : string = '/api/ruleset/register'
	let options = {
		uri: 'http://' + URL.host + queryString,
		body: {
			"src":ruleset
		},
		json: true
	}
	requestPromise(options).then(function(resultBody) {
		window.showInformationMessage('Ruleset ' + resultBody.rid + ' Registered at ' + URL.host)
	}).catch(function (err){
		if (err.message) {
			window.showErrorMessage('Unable to register ruleset to pico engine at ' + URL.host + ' got error ' + err.message)
		} else {
			window.showErrorMessage('Unable to register ruleset to engine at ' + URL.host)
		}
	})
}



export function activate(context: ExtensionContext) {
	console.log("KRL Extension Activated")
	console.log(context.extensionPath)
	// Local Extension Functionality Setup
	const registerRulesetCmd : string = 'krlkLangSupport.registerRuleset'
	const registerRulesetPromptCmd : string = 'krlLangSupport.registerRulesetPrompt'

	const registerRulesetHandler = () => {
		let defaultHost : string = workspace.getConfiguration('krlLanguageSupport.picoEngine') .get('defaultHost', 'localhost:8080') 
		registerRuleset(parse('http://' + defaultHost))
	}

	let lastUsedHost : string | undefined = undefined
	const registerRulesetPromptHandler = () => {
		let options : InputBoxOptions = {
			'prompt':'Enter a reachable pico engine host',
			'placeHolder':'http://localhost:8080',
			'value': lastUsedHost || ''
		}
		window.showInputBox(options).then(function(url? : string) {
			if (url) {
				registerRuleset(parse(url))
				lastUsedHost = url
			}
		})
	}
	context.subscriptions.push(commands.registerCommand(registerRulesetCmd, registerRulesetHandler))
	context.subscriptions.push(commands.registerCommand(registerRulesetPromptCmd, registerRulesetPromptHandler))
	
	// Language Server Setup
	// The server is implemented in node
	let serverModule = context.asAbsolutePath(
		path.join('krl-language-server', 'out', 'server.js')
	);
	// The debug options for the server
	// --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
	let debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	let serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions
		}
	};

	// Options to control the language client
	let clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: [{ scheme: 'file', language: 'KRL' }],
		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		}
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'krlLanguageServer',
		'KRL Language Server',
		serverOptions,
		clientOptions
	);

	// Start the client. This will also launch the server
	client.start();
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
