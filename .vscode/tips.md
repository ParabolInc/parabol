# Tips

## copy extensions from stable to insiders

code --list-extensions | xargs -L 1 code-insiders --install-extension

# Good extensions

- [GraphQL](https://marketplace.visualstudio.com/items?itemName=GraphQL.vscode-graphql) for IntelliSense and syntax highlighting.
- dbaeumer.vscode-eslint: ESLint
- eamodio.gitlens: good git history everywhere
- Equinusocio.vsc-material-theme: pretty
- geddski.macros: for executing 2 events for 1 keystroke. Useful for toggling line comment & moving down a line
- GitHub.vscode-pull-request-github: for code reviews
- jasonlhy.hungry-delete: hit backspace to go back to somewhere meaningful
- ms-azuretools.vscode-docker: haven't used yet
- msjsdiag.debugger-for-chrome: chrome debugger
- PKief.material-icon-theme: pretty
- Shan.code-settings-sync: syncs settings to a gist
- sleistner.vscode-fileutils: lets you move files
- xyz.local-history: saves a copy of every file on every file change.

# Bad extensions

- Flow Language Support: causes goto definition (ctrl + click) to go to the import statement.
- Apollo GraphQL (apollographql.vscode-apollo): makes autosuggest popups painfully slow!

## Other tips and tricks

- On a Mac, TypeScript imports can be incorrect, e.g. it tries to import from 'server/...'. To fix, go to VSCode Settings (UI), type "import module" into the search, and change TypeScript > Preferences: Import Module Specifier from "auto" to "relative".
