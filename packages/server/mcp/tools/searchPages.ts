import {z} from 'zod'
import defineTool from '../defineTool'
import runGraphQL from '../runGraphQL'
import {readAnnotations} from '../toolAnnotations'
import toolResult from '../toolResult'

const SEARCH_PAGES = `
  query SearchPages($query: String!, $first: Int!) {
    viewer {
      search(query: $query, first: $first, type: page) {
        edges {
          snippets
          node {
            ... on Page {
              id
              title
            }
          }
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  }
`

export default defineTool({
  name: 'search_pages',
  title: 'Search pages',
  description:
    'Find pages by words in their title or content, best matches first, with snippets showing why each matched. Open one with read_page. Needs users:read.',
  inputSchema: {
    query: z.string().min(1).describe('The words to look for'),
    first: z.number().int().min(1).max(100).default(20).describe('Most pages to return')
  },
  annotations: readAnnotations,
  run: async (context, {query, first}) =>
    toolResult(await runGraphQL(context, SEARCH_PAGES, {query, first}))
})
