import {createContext} from 'react'

// Whether the viewer can open each page linked from the open page, by page code: missing means not loaded
export const PageLinkAccessContext = createContext<ReadonlyMap<number, boolean>>(new Map())
