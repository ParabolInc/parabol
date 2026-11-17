import type {JSONContent} from '@tiptap/core'
import type {Team} from './heavyCorpusData'
import {heading, pageLinkBlock} from './tiptapNodes'

const buildMeetingSummariesPage = (
  team: Team,
  summaryTitles: string[],
  firstPageCode: number
): JSONContent => ({
  type: 'doc',
  content: [
    heading(1, `${team.name} Meeting Summaries`),
    ...summaryTitles.map((title, index) => pageLinkBlock(firstPageCode + index, title))
  ]
})

export default buildMeetingSummariesPage
