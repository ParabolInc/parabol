const importAllStrings = (context: __WebpackModuleApi.RequireContext) => {
  return context.keys().map((id) => context(id))
}

export const typeDefs = importAllStrings(require.context('./typeDefs', false, /.graphql$/))
