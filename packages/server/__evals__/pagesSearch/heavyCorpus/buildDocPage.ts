import type {JSONContent} from '@tiptap/core'
import type {Random} from './createRandom'
import {
  CHANGE_LOG_CHANGES,
  DOC_FILLER,
  type DocSpec,
  FAQ,
  GENERIC_FILLER,
  STATUS_UPDATES
} from './heavyCorpusData'
import {fill, formatMeetingDate} from './heavyCorpusFormat'
import {bulletList, heading, orderedList, paragraph, table} from './tiptapNodes'

interface DocContext {
  members: string[]
  relatedTitles: string[]
}

const DAY_MS = 86_400_000

const buildDocPage = (
  random: Random,
  doc: DocSpec,
  {members, relatedTitles}: DocContext
): JSONContent => {
  const {component} = doc
  const fillSlots = (template: string) => {
    const [person, otherPerson] = random.shuffle(members)
    return fill(template, {
      component,
      person: person!,
      otherPerson: otherPerson!,
      number: String(random.int(2, 6))
    })
  }
  const fillers = random.shuffle([...DOC_FILLER[doc.kind], ...GENERIC_FILLER])
  let fillerIndex = 0
  const nextFiller = () => fillSlots(fillers[fillerIndex++ % fillers.length]!)
  const prose = (sentenceCount: number, facts: string[] = []) =>
    paragraph([...facts, ...Array.from({length: sentenceCount}, nextFiller)].join(' '))
  const sections = doc.sections.flatMap(({heading: title, facts, list, table: sectionTable}) => [
    heading(2, title),
    prose(random.int(4, 5), facts),
    ...(list
      ? [title === 'Steps' ? orderedList(list) : bulletList(list.map((item) => paragraph(item)))]
      : []),
    ...(sectionTable ? [table(sectionTable.header, sectionTable.rows)] : []),
    ...(random.chance(0.9) ? [prose(random.int(3, 4))] : [])
  ])
  const updatedAt = new Date(doc.updatedAt)
  const statusUpdates = random
    .shuffle(STATUS_UPDATES)
    .slice(0, random.int(6, 9))
    .map((update, index) => {
      const date = new Date(updatedAt.getTime() - index * 7 * DAY_MS)
      return `${formatMeetingDate(date)}: ${fillSlots(update)}`
    })
  const questions = random
    .shuffle(FAQ)
    .slice(0, random.int(3, 5))
    .flatMap(([question, answer]) => [paragraph(question!), paragraph(fillSlots(answer!))])
  const changeLog = Array.from({length: random.int(4, 7)}, (_, index) => {
    const date = new Date(updatedAt.getTime() - (index * 9 + random.int(0, 6)) * DAY_MS)
    const change = fill(random.pick(CHANGE_LOG_CHANGES), {
      section: random.pick(doc.sections).heading,
      component
    })
    return `${formatMeetingDate(date)}: ${random.pick(members)} ${change}`
  })
  return {
    type: 'doc',
    content: [
      heading(1, doc.title),
      ...(doc.intro ? [paragraph(doc.intro)] : []),
      ...sections,
      heading(2, 'Status updates'),
      bulletList(statusUpdates.map((entry) => paragraph(entry))),
      heading(2, 'FAQ'),
      ...questions,
      heading(2, 'Related documents'),
      bulletList(relatedTitles.map((title) => paragraph(title))),
      heading(2, 'Change log'),
      bulletList(changeLog.map((entry) => paragraph(entry)))
    ]
  }
}

export default buildDocPage
