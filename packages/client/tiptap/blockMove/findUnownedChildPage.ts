import type Atmosphere from '../../Atmosphere'
import {lookupPageViewerAccess} from '../../hooks/usePageViewerAccess'
import type {MovableBlocks} from './getMovableBlocks'

export const findUnownedChildPage = (
  atmosphere: Atmosphere,
  childPages: MovableBlocks['childPages']
) =>
  childPages.find(({pageCode}) => {
    const role = lookupPageViewerAccess(atmosphere, pageCode)
    return role !== undefined && role !== 'owner'
  })
