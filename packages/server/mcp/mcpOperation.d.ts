declare module '*.graphql?mcp' {
  const tool: import('./OperationTool').default
  export = tool
}
