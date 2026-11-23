import {isInputObjectType, isInterfaceType, isObjectType} from 'graphql'
import {z} from 'zod'
import rootSchema from '../../graphql/public/rootSchema'
import defineTool from '../defineTool'
import getSchemaDescriptionLine from '../getSchemaDescriptionLine'
import {textResult} from '../toolResult'

const DEFAULT_LIMIT = 20

export default defineTool({
  name: 'search_schema',
  title: 'Search the GraphQL schema',
  description:
    'Find types and fields in the Parabol GraphQL schema by name or description. Returns matching names with a one-line description. Use describe_type to see a type in full.',
  inputSchema: {
    query: z.string().min(1).describe('Words to look for in type and field names and descriptions'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .default(DEFAULT_LIMIT)
      .describe('Most matches to return')
  },
  annotations: {readOnlyHint: true},
  run: (_context, {query, limit}) => {
    const needles = query.toLowerCase().split(/\s+/).filter(Boolean)
    const matches: {rank: number; text: string}[] = []
    const consider = (name: string, description: string | null | undefined, detail = '') => {
      const lowerName = name.toLowerCase()
      const haystack = `${lowerName} ${description?.toLowerCase() ?? ''}`
      if (!needles.every((needle) => haystack.includes(needle))) return
      const isExact = needles.length === 1 && lowerName.split('.').includes(needles[0]!)
      const isNameMatch = needles.every((needle) => lowerName.includes(needle))
      const line = getSchemaDescriptionLine(description)
      matches.push({
        rank: isExact ? 0 : isNameMatch ? 1 : 2,
        text: `${name}${detail}${line ? `: ${line}` : ''}`
      })
    }
    for (const type of Object.values(rootSchema.getTypeMap())) {
      if (type.name.startsWith('__')) continue
      consider(type.name, type.description)
      if (isObjectType(type) || isInterfaceType(type) || isInputObjectType(type)) {
        for (const field of Object.values(type.getFields())) {
          consider(`${type.name}.${field.name}`, field.description, `: ${field.type}`)
        }
      }
    }
    matches.sort((a, b) => a.rank - b.rank)
    if (!matches.length) return textResult(`No types or fields match "${query}".`)
    const shown = matches.slice(0, limit).map(({text}) => text)
    const more = matches.length - shown.length
    return textResult(
      shown.join('\n') + (more > 0 ? `\n…${more} more: narrow the query or raise limit` : '')
    )
  }
})
