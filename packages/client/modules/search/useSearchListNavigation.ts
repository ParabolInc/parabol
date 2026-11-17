import {type Ref, useImperativeHandle, useLayoutEffect} from 'react'
import {useNavigate} from 'react-router'
import type {getSearchResultHref_page$key} from '../../__generated__/getSearchResultHref_page.graphql'
import {getSearchResultHref} from './getSearchResultHref'
import {getSelection} from './getSelection'
import {ResultsListRefHandler} from './SearchDialogContent'

export const useSearchListNavigation = (
  resultsListRef: Ref<ResultsListRefHandler>,
  edges: readonly {
    node: getSearchResultHref_page$key & {id?: string | null | undefined}
  }[],
  closeSearch: () => void,
  selectedId: string | null,
  setSelectedId: (id: string | null) => void
) => {
  const navigate = useNavigate()
  const {index: selectedIndex, id: shownId} = getSelection(
    edges.map(({node}) => node.id),
    selectedId
  )
  const setSelectedIndex = (index: number) => {
    setSelectedId(edges[index]?.node.id ?? null)
  }

  useLayoutEffect(() => {
    if (shownId !== selectedId) setSelectedId(shownId)
  }, [shownId, selectedId])

  useImperativeHandle(resultsListRef, () => ({
    onKeyDown: (e: React.KeyboardEvent) => {
      if (edges.length === 0) return false

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(Math.max(0, selectedIndex - 1))
        return true
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(Math.min(edges.length - 1, selectedIndex + 1))
        return true
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        const selectedEdge = edges[selectedIndex]
        if (!selectedEdge) return false
        const href = getSearchResultHref(selectedEdge.node)
        closeSearch()
        if (e.metaKey || e.ctrlKey) {
          window.open(href, '_blank')
        } else {
          navigate(href)
        }
        return true
      }
      return false
    }
  }))

  return {selectedIndex, setSelectedIndex}
}
