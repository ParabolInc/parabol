import {type Ref, useImperativeHandle} from 'react'
import {useNavigate} from 'react-router'
import {getPageSlug} from '../../tiptap/getPageSlug'
import {GQLID} from '../../utils/GQLID'
import {getSelectedIndex} from './getSelectedIndex'
import {ResultsListRefHandler} from './SearchDialogContent'

export const useSearchListNavigation = (
  resultsListRef: Ref<ResultsListRefHandler>,
  edges: readonly {
    node: {
      id?: string | null | undefined
      title?: string | null | undefined
    }
  }[],
  closeSearch: () => void,
  selectedId: string | null,
  setSelectedId: (id: string | null) => void
) => {
  const navigate = useNavigate()
  const selectedIndex = getSelectedIndex(
    edges.map(({node}) => node.id),
    selectedId
  )
  const setSelectedIndex = (index: number) => {
    setSelectedId(edges[index]?.node.id ?? null)
  }

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
        const {node} = selectedEdge
        const {id, title} = node
        const [pageCode] = GQLID.fromKey(id!)
        const slug = getPageSlug(Number(pageCode), title!)
        closeSearch()
        if (e.metaKey || e.ctrlKey) {
          window.open(`/pages/${slug}`, '_blank')
        } else {
          navigate(`/pages/${slug}`)
        }
        return true
      }
      return false
    }
  }))

  return {selectedIndex, setSelectedIndex}
}
