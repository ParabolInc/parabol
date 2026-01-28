import graphql from 'babel-plugin-relay/macro'
import {isSameWeek, isToday, isYesterday, parseISO, subWeeks} from 'date-fns'
import {useFragment} from 'react-relay'
import type {SearchDialogResultsRecent_edges$key} from '../../__generated__/SearchDialogResultsRecent_edges.graphql'
import {SearchDialogResult} from '../Dashboard/SearchDialogResult'
import {SearchResultSectionHeader} from './SearchResultSectionHeader'

interface Props {
  edges: SearchDialogResultsRecent_edges$key
}

export const SearchDialogResultsRecent = (props: Props) => {
  const edges = useFragment(
    graphql`
      fragment SearchDialogResultsRecent_edges on SearchResultEdge @relay(plural: true) {
        ...SearchDialogResult_edge
        node {
          ... on Page {
            id
            updatedAt
          }
        }
      }
    `,
    props.edges
  )

  const today: any[] = []
  const yesterday: any[] = []
  const thisWeek: any[] = []
  const lastWeek: any[] = []
  const older: any[] = []

  const now = new Date()
  const lastWeekDate = subWeeks(now, 1)

  edges.forEach((edge) => {
    const {node} = edge
    const updatedAt = (node as any)?.updatedAt
    if (!updatedAt) {
      older.push(edge)
      return
    }
    const date = parseISO(updatedAt)

    if (isToday(date)) {
      today.push(edge)
    } else if (isYesterday(date)) {
      yesterday.push(edge)
    } else if (isSameWeek(date, now)) {
      thisWeek.push(edge)
    } else if (isSameWeek(date, lastWeekDate)) {
      lastWeek.push(edge)
    } else {
      older.push(edge)
    }
  })

  const sections = [
    {title: 'Today', items: today},
    {title: 'Yesterday', items: yesterday},
    {title: 'This Week', items: thisWeek},
    {title: 'Last Week', items: lastWeek},
    {title: 'Older', items: older}
  ]

  return (
    <div>
      {sections.map(({title, items}) => {
        if (items.length === 0) return null
        return (
          <div key={title}>
            <SearchResultSectionHeader title={title} />
            {items.map((edge) => {
              const {node} = edge
              const id = node?.id ?? 'new'
              return <SearchDialogResult edgeRef={edge} key={id} />
            })}
          </div>
        )
      })}
    </div>
  )
}
