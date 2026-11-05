import type {JSONContent} from '@tiptap/core'
import type {Team} from './heavyCorpusData'
import {formatMeetingDate, plural} from './heavyCorpusFormat'
import {bulletList, heading, paragraph, table} from './tiptapNodes'

const buildPokerPage = (
  team: Team,
  date: Date,
  pokerNumber: number,
  participants: string[],
  estimates: [story: string, points: string][]
): JSONContent => {
  const day = formatMeetingDate(date)
  return {
    type: 'doc',
    content: [
      heading(1, `${team.short} Sprint Poker #${pokerNumber} - ${day}`),
      paragraph(team.name, ` — ${day}`),
      paragraph(
        `${plural(estimates.length, 'Story', 'Stories')} - ${plural(participants.length, 'Participant')}`
      ),
      paragraph(),
      table(['Story', 'Story Points'], estimates),
      heading(2, plural(participants.length, 'Participant')),
      bulletList(participants.map((name) => paragraph(name))),
      paragraph()
    ]
  }
}

export default buildPokerPage
