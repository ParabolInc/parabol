# Tips

## copy extensions from stable to insiders

code --list-extensions | xargs -L 1 code-insiders --install-extension

# Bad extensions
- Flow Language Support: causes goto definition (ctrl + click) to go to the import statement.
