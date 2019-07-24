import {useEffect, useRef, useState} from 'react'
import TypeAheadFilter from '../utils/TypeAheadFilter'

const useFilteredItems = (query: string, items: readonly any[]) => {
  const typeAheadFilterRef = useRef(new TypeAheadFilter())
  const [filteredItems, setFilteredItems] = useState(items)
  useEffect(() => {
    if (items.length === 0) return
    if (!query) {
      setFilteredItems(items)
      return
    }
    const res = typeAheadFilterRef.current.compare(query, items, (item) => {
      const str = item.nameWithOwner || item.projectName
      return str.toLowerCase()
    })
    setFilteredItems(res)
  }, [query, items])
  return filteredItems
}

export default useFilteredItems
