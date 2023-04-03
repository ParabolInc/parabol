import useFilteredItems from '~/hooks/useFilteredItems'
import useForm from '~/hooks/useForm'

// Matches 'items' based on the item's 'getValue' result and the value passed to 'onQueryChange'.
const useSearchFilter = <T>(items: readonly T[], getValue: (item: T) => string) => {
  const {fields, onChange, setValue} = useForm({
    search: {
      getDefault: () => ''
    }
  })
  const resetQuery = () => setValue('search', '')
  const {search} = fields
  const {value} = search
  const query = value.toLowerCase()
  const filteredItems = useFilteredItems(query, items, (item) => getValue(item).toLowerCase())
  return {query: value, filteredItems, onQueryChange: onChange, resetQuery}
}

export default useSearchFilter
