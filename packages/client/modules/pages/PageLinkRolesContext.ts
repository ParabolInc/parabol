import {createContext} from 'react'
import type {PageRoleEnum} from '../../__generated__/PageLinkRolesQuery.graphql'

// The viewer's role on each page linked from the open page, by page code: null means no access, missing means not loaded
export const PageLinkRolesContext = createContext<ReadonlyMap<number, PageRoleEnum | null>>(
  new Map()
)
