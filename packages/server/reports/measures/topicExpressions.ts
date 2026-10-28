import {type Expression, expressionBuilder} from 'kysely'
import type {DB} from '../../postgres/types/pg'

const eb = expressionBuilder<DB>()

// A discussion's topic is its retro group's title or its check-in agenda item. Other discussions have none.
// Topics match whatever their case, so the same topic in two retros adds up
export const topicOf = ({
  title,
  smartTitle,
  content
}: {
  title: Expression<string | null>
  smartTitle: Expression<string | null>
  content: Expression<string | null>
}) => {
  const text = eb.fn<string | null>('nullif', [
    eb.fn('btrim', [eb.fn.coalesce(title, smartTitle, content)]),
    eb.val('')
  ])
  return {
    key: eb.fn<string | null>('lower', [text]),
    label: text,
    requires: eb(text, 'is not', null)
  }
}
