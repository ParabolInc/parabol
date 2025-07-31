// TipTapRenderContext.ts
import type {Extensions, generateHTML, generateJSON, JSONContent} from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import {createContext, type ReactNode, useContext} from 'react'

export interface TipTapContextValue {
  generateHTML: (doc: JSONContent, extensions?: Extensions) => string
  generateJSON: (html: string, extensions?: Extensions) => JSONContent
}

export const TipTapRenderContext = createContext<TipTapContextValue | null>(null)

export function useTipTapContext(): TipTapContextValue {
  const ctx = useContext(TipTapRenderContext)
  if (!ctx) throw new Error('useTipTapContext must be used within a <TipTapProvider>')
  return ctx
}

interface Props {
  children: ReactNode
  generateHTML: typeof generateHTML
  generateJSON: typeof generateJSON
  extensions?: Extensions
}
export function TipTapProvider(props: Props) {
  const defaultExtensions: Extensions = props.extensions || [StarterKit]
  const generateHTML = (doc: JSONContent, extensions = defaultExtensions) => {
    return props.generateHTML(doc, extensions)
  }
  const generateJSON = (html: string, extensions = defaultExtensions): JSONContent => {
    return props.generateJSON(html, extensions)
  }

  return (
    <TipTapRenderContext.Provider value={{generateHTML, generateJSON}}>
      {props.children}
    </TipTapRenderContext.Provider>
  )
}
