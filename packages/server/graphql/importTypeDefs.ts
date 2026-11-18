import {type DocumentNode, parse, visit} from 'graphql'

// deletionDate exists for Biome's useDeprecatedDate; GraphQL's own @deprecated only takes a reason
const importTypeDefs = (context: __WebpackModuleApi.RequireContext): DocumentNode[] =>
  context.keys().map((id) =>
    visit(parse(context(id)), {
      Directive: (directive) => {
        if (directive.name.value !== 'deprecated') return undefined
        const args = directive.arguments?.filter(({name}) => name.value !== 'deletionDate')
        return {...directive, arguments: args}
      }
    })
  )

export default importTypeDefs
