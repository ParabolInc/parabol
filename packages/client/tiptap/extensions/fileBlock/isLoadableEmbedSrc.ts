import {getParabolAssetPath} from './getParabolAssetPath'
import {isLocalEmbedSource} from './localEmbedSources'

// A URL someone else added could be a tracking pixel, so only Parabol's own assets & what this user added get loaded
export const isLoadableEmbedSrc = (src: string) =>
  isLocalEmbedSource(src) ||
  src.startsWith('blob:') ||
  src.startsWith('data:') ||
  getParabolAssetPath(src) !== null
