import {createContext, useContext} from 'react'

export type InspirationVariant = 'drawer' | 'sheet'

export interface InspirationPresentation {
  variant: InspirationVariant
  onAdded?: () => void
}

const InspirationPresentationContext = createContext<InspirationPresentation>({variant: 'drawer'})

export const useInspirationPresentation = () => useContext(InspirationPresentationContext)

export default InspirationPresentationContext
