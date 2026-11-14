import {useDeferredValue} from 'react'
import moveToPageResultsQuery, {
  type MoveToPageResultsQuery
} from '../../../__generated__/MoveToPageResultsQuery.graphql'
import {EmptyDropdownMenuItemLabel} from '../../../components/EmptyDropdownMenuItemLabel'
import ErrorBoundary from '../../../components/ErrorBoundary'
import {useQueryLoaderNowWithRetry} from '../../../hooks/useQueryLoaderNow'
import MenuSkeletonRows from '../../../ui/Menu/MenuSkeletonRows'
import type {BlockDragState} from '../../blockMove/getBlockDropRefusal'
import MoveToPageResults, {type MoveToPageFirstAllowed} from './MoveToPageResults'

interface Props {
  textFilter: string
  drag: BlockDragState
  onPick: (pageId: string, title: string) => void
  onFirstAllowed: (first: MoveToPageFirstAllowed) => void
}

const MoveToPageResultsRoot = (props: Props) => {
  const {textFilter, ...resultProps} = props
  const deferredTextFilter = useDeferredValue(textFilter)
  const {queryRef} = useQueryLoaderNowWithRetry<MoveToPageResultsQuery>(
    moveToPageResultsQuery,
    {textFilter: deferredTextFilter},
    {transition: true}
  )
  if (!queryRef) return <MenuSkeletonRows count={4} />
  return (
    <ErrorBoundary
      resetKey={deferredTextFilter}
      fallback={() => (
        <EmptyDropdownMenuItemLabel className='text-fg-muted'>
          Couldn’t load pages
        </EmptyDropdownMenuItemLabel>
      )}
    >
      <MoveToPageResults queryRef={queryRef} {...resultProps} />
    </ErrorBoundary>
  )
}

export default MoveToPageResultsRoot
