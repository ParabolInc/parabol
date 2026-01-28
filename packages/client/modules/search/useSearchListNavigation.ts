import {type Ref, useEffect, useImperativeHandle, useState} from 'react'
import {useHistory} from 'react-router'
import {getPageSlug} from '../../tiptap/getPageSlug'
import {GQLID} from '../../utils/GQLID'
import {ResultsListRefHandler} from './SearchDialogContent'

export const useSearchListNavigation = (
  resultsListRef: Ref<ResultsListRefHandler>,
  edges: readonly {
    node: {
      id?: string | null | undefined
      title?: string | null | undefined
    }
  }[],
  closeSearch: () => void
) => {
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const history = useHistory()

  useEffect(() => {
    if (selectedIndex === -1) return
    setSelectedIndex(0)
  }, [edges])

  useImperativeHandle(resultsListRef, () => ({
    onKeyDown: (e: React.KeyboardEvent) => {
      if (edges.length === 0) return false

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(0, prev - 1))
        return true
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(edges.length - 1, prev + 1))
        return true
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        const selectedEdge = edges[selectedIndex]
        if (!selectedEdge) return false
        const {node} = selectedEdge
        const {id, title} = node
        const [pageCode] = GQLID.fromKey(id!)
        const slug = getPageSlug(Number(pageCode), title!)
        closeSearch()
        if (e.metaKey || e.ctrlKey) {
          window.open(`/pages/${slug}`, '_blank')
        } else {
          history.push(`/pages/${slug}`)
        }
        return true
      }
      return false
    }
  }))

  return {selectedIndex, setSelectedIndex}
}
