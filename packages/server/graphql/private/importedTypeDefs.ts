const importAllStrings = (context: __WebpackModuleApi.RequireContext) => {
  return context.keys().map((id) => context(id).default)
}
export const typeDefs = importAllStrings(require.context('./typeDefs', false, /.graphql$/))
