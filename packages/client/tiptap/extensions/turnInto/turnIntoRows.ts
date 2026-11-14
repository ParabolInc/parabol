import type {Node} from '@tiptap/pm/model'
import type {IconComponent} from '~/ui/icons'
import {
  ArrowRight,
  Checklist,
  Code,
  FormatH1,
  FormatH2,
  FormatH3,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  NoteAdd,
  Notes,
  TextFields
} from '~/ui/icons'
import {canTurnIntoPage, isInsideCallout, type TurnIntoTarget} from './turnBlockInto'

export const turnIntoRows: {title: string; icon: IconComponent; target: TurnIntoTarget}[] = [
  {title: 'Text', icon: TextFields, target: {type: 'paragraph'}},
  {title: 'Heading 1', icon: FormatH1, target: {type: 'heading', level: 1}},
  {title: 'Heading 2', icon: FormatH2, target: {type: 'heading', level: 2}},
  {title: 'Heading 3', icon: FormatH3, target: {type: 'heading', level: 3}},
  {title: 'Page', icon: NoteAdd, target: {type: 'pageLinkBlock'}},
  {title: 'Bullet list', icon: FormatListBulleted, target: {type: 'bulletList'}},
  {title: 'Numbered list', icon: FormatListNumbered, target: {type: 'orderedList'}},
  {title: 'To-do list', icon: Checklist, target: {type: 'taskList'}},
  {title: 'Details', icon: ArrowRight, target: {type: 'details'}},
  {title: 'Code', icon: Code, target: {type: 'codeBlock'}},
  {title: 'Quote', icon: FormatQuote, target: {type: 'blockquote'}},
  {title: 'Callout', icon: Notes, target: {type: 'callout'}}
]

export const getTurnIntoRows = (
  doc: Node,
  pos: number,
  current: TurnIntoTarget,
  canCreateSubPage: boolean
) => {
  const isInCallout = isInsideCallout(doc, pos)
  return turnIntoRows.filter(({target}) => {
    if (target.type === 'callout') return !isInCallout
    return target.type !== 'pageLinkBlock' || (canCreateSubPage && canTurnIntoPage(current))
  })
}

export const findTurnIntoRow = (rows: typeof turnIntoRows, current: TurnIntoTarget) =>
  rows.find(({target}) => target.type === current.type && target.level === current.level)
