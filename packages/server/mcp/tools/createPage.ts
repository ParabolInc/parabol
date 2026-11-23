import {z} from 'zod'
import defineTool from '../defineTool'
import runGraphQL from '../runGraphQL'
import {writeAnnotations} from '../toolAnnotations'
import toolError from '../toolError'
import toolResult from '../toolResult'

const CREATE_PAGE = `
  mutation CreatePage($teamId: ID) {
    createPage(teamId: $teamId) {
      page {
        id
      }
    }
  }
`

const EDIT_PAGE_CONTENT = `
  mutation EditPageContent($pageId: ID!, $content: String!) {
    editPageContent(pageId: $pageId, content: $content, format: markdown) {
      page {
        id
        title
      }
    }
  }
`

export default defineTool({
  name: 'create_page',
  title: 'Create a page',
  description:
    'Create a page from markdown, shared with a team or, without teamId, private to you. A connection limited to some organizations, teams or pages can only create team pages. Needs pages:write.',
  inputSchema: {
    title: z.string().min(1).describe('The page title, on one line'),
    markdown: z.string().describe('The page body, in markdown, without the title'),
    teamId: z.string().optional().describe('The team to share the page with, from get_me')
  },
  annotations: writeAnnotations,
  run: async (context, {title, markdown, teamId}) => {
    if (!teamId && !context.grant.resourceGrants.isUnrestricted()) {
      return toolError(
        'This connection is limited to some organizations, teams or pages, so it could not open a private page. Pass the teamId of a team it reaches, or reconnect with Organizations and Pages both set to All.',
        'FORBIDDEN'
      )
    }
    const created = await runGraphQL<{createPage: {page: {id: string}}}>(context, CREATE_PAGE, {
      teamId
    })
    if (created.errors?.length || !created.data) return toolResult(created)
    const {id: pageId} = created.data.createPage.page
    return toolResult(
      await runGraphQL(context, EDIT_PAGE_CONTENT, {pageId, content: `# ${title}\n\n${markdown}`})
    )
  }
})
