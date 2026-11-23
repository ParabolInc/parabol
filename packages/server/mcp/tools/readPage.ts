import {z} from 'zod'
import defineTool from '../defineTool'
import runGraphQL from '../runGraphQL'
import {readAnnotations} from '../toolAnnotations'
import toolResult from '../toolResult'

const READ_PAGE = `
  query ReadPage($pageId: ID!) {
    public {
      page(pageId: $pageId) {
        id
        title
        content(format: markdown)
      }
    }
  }
`

export default defineTool({
  name: 'read_page',
  title: 'Read a page',
  description:
    'Read a page as markdown, with its title. Copy text from here into edit_page to change it. Needs pages:read.',
  inputSchema: {
    pageId: z.string().describe('The page id, from search_pages, create_page or a meeting')
  },
  annotations: readAnnotations,
  run: async (context, {pageId}) => toolResult(await runGraphQL(context, READ_PAGE, {pageId}))
})
