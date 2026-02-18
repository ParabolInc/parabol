import {createContext, type ReactNode, useContext, useState} from 'react'

interface SearchContextType {
  isOpen: boolean
  initialQuery: string
  openSearch: (query?: string) => void
  closeSearch: () => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export const useSearchDialog = () => {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error('useSearchDialog must be used within a SearchProvider')
  }
  return context
}

interface SearchProviderProps {
  children: ReactNode
}

export const SearchProvider = ({children}: SearchProviderProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [initialQuery, setInitialQuery] = useState('')

  const openSearch = (query: string = '') => {
    setInitialQuery(query)
    setIsOpen(true)
  }

  const closeSearch = () => {
    setIsOpen(false)
  }

  return (
    <SearchContext.Provider value={{isOpen, initialQuery, openSearch, closeSearch}}>
      {children}
    </SearchContext.Provider>
  )
}
