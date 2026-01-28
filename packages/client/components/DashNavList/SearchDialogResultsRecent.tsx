import graphql from 'babel-plugin-relay/macro'
import {isSameWeek, isToday, isYesterday, parseISO, subWeeks} from 'date-fns'
import {type Ref, useMemo} from 'react'
import {useFragment} from 'react-relay'
import type {SearchDialogResultsRecent_edges$key} from '../../__generated__/SearchDialogResultsRecent_edges.graphql'
import type {ResultsListRefHandler} from '../Dashboard/SearchDialog'
import {SearchDialogResult} from '../Dashboard/SearchDialogResult'
import {SearchResultSectionHeader} from './SearchResultSectionHeader'
import {useSearchListNavigation} from './useSearchListNavigation'

interface Props {
  edgesRef: SearchDialogResultsRecent_edges$key
  closeSearch: () => void
  resultsListRef: Ref<ResultsListRefHandler>
}

export const SearchDialogResultsRecent = (props: Props) => {
  const {closeSearch, edgesRef, resultsListRef} = props
  const edges = useFragment(
    graphql`
      fragment SearchDialogResultsRecent_edges on SearchResultEdge @relay(plural: true) {
        ...SearchDialogResult_edge
        node {
          ... on Page {
            id
            updatedAt
            title
          }
        }
      }
    `,
    edgesRef
  )

  type Edge = (typeof edges)[number]

  const sections = useMemo(() => {
    const today: Edge[] = []
    const yesterday: Edge[] = []
    const thisWeek: Edge[] = []
    const lastWeek: Edge[] = []
    const older: Edge[] = []
    const now = new Date()
    const lastWeekDate = subWeeks(now, 1)
    edges.forEach((edge) => {
      const {node} = edge
      const {updatedAt} = node
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

    return [
      {title: 'Today', items: today},
      {title: 'Yesterday', items: yesterday},
      {title: 'This Week', items: thisWeek},
      {title: 'Last Week', items: lastWeek},
      {title: 'Older', items: older}
    ]
  }, [edges])

  const flatItems = useMemo(() => {
    return sections.flatMap((s) => s.items)
  }, [sections])

  const {selectedIndex, setSelectedIndex} = useSearchListNavigation(
    resultsListRef,
    flatItems,
    closeSearch
  )

  let flatIdx = 0
  return (
    <>
      {sections.map(({title, items}) => {
        if (items.length === 0) return null
        return (
          <div key={title}>
            <SearchResultSectionHeader title={title} />
            {items.map((edge) => {
              const {node} = edge
              const {id} = node
              const currentIndex = flatIdx++
              return (
                <SearchDialogResult
                  edgeRef={edge}
                  key={id}
                  closeSearch={closeSearch}
                  isActive={currentIndex === selectedIndex}
                  setSelectedIndex={() => setSelectedIndex(currentIndex)}
                />
              )
            })}
          </div>
        )
      })}
    </>
  )
}
