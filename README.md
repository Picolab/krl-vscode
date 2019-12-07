# KRL VS Code Support

This repo contains a VS code extension under "client" and a git submodule that links to the KRL language server. 
This extension provides basic KRL support to vS code including:

* Document Symbols
* Completion Items
* Syntax Highlighting
* Diagnostics (Linter)

## Structure


## Running the Extension

- Run `npm install` in this folder. This installs all necessary npm modules in both the client and server folder
- Open VS Code on this folder.
- Press Ctrl+Shift+B to compile the client and server.
- Switch to the Debug viewlet.
- Select `Launch Client` from the drop down.
- Run the launch config.
- If you want to debug the server as well use the launch configuration `Attach to Server`
- In the [Extension Development Host] instance of VSCode, open a document in 'KRL' language mode.
