import {TenorManager} from '../../../utils/TenorManager'
import {QueryResolvers} from '../resolverTypes'

export interface SSORelayState {
  isInvited?: boolean
  metadataURL?: string
}

const searchGifs: QueryResolvers['searchGifs'] = async (_source, {query, first, after}) => {
  const service = process.env.GIF_PROVIDER || 'tenor'
  if (service === 'tenor') {
    const manager = new TenorManager()
    const request =
      query === ''
        ? manager.featured({limit: first, pos: after})
        : manager.search({query, limit: first, pos: after})
    const res = await request
    if (res instanceof Error) {
      throw res
    }
    const {next, results} = res
    const nodes = results.map((result) => {
      const {content_description: description, tags, id, media_formats} = result
      const {
        nanowebp_transparent: nano,
        tinywebp_transparent: tiny,
        webp_transparent: webp,
        webp: original
      } = media_formats
      const urlOriginal = webp || original || tiny || nano
      const urlTiny = tiny || webp || original || nano
      const urlNano = nano || tiny || webp || original
      return {
        id,
        description,
        tags,
        urlOriginal: urlOriginal?.url ?? '',
        urlTiny: urlTiny?.url ?? '',
        urlNano: urlNano?.url ?? ''
      }
    })
    const edges = nodes.map((node, idx) => ({
      node,
      cursor: idx === nodes.length - 1 ? next : null
    }))

    return {
      pageInfo: {
        hasNextPage: !!next,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: next
      },
      edges
    }
  }
  console.log(`${service} NOT IMPLEMENTED!`)
  return {
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null
    },
    edges: []
  }
}

export default searchGifs
