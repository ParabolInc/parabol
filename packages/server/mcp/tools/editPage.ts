import {z} from 'zod'
import defineTool from '../defineTool'
import runGraphQL from '../runGraphQL'
import {writeAnnotations} from '../toolAnnotations'
import toolResult from '../toolResult'

const PATCH_PAGE_CONTENT = `
  mutation PatchPageContent($pageId: ID!, $edits: [PageContentEditInput!]!) {
    patchPageContent(pageId: $pageId, edits: $edits) {
      page {
        id
        title
      }
    }
  }
`

export default defineTool({
  name: 'edit_page',
  title: 'Edit a page',
  description:
    'Change a page by finding exact runs of its markdown and replacing them, in order and all or nothing. Read the page first with read_page and copy the text to find. Each oldText must appear exactly once unless replaceAll is true. Needs pages:write.',
  inputSchema: {
    pageId: z.string().describe('The page id'),
    edits: z
      .array(
        z.object({
          oldText: z.string().describe('Markdown copied from read_page'),
          newText: z.string().describe('Markdown to put in its place'),
          replaceAll: z.boolean().optional().describe('Replace every match instead of exactly one')
        })
      )
      .describe('The edits to apply')
  },
  annotations: writeAnnotations,
  run: async (context, {pageId, edits}) =>
    toolResult(await runGraphQL(context, PATCH_PAGE_CONTENT, {pageId, edits}))
})
