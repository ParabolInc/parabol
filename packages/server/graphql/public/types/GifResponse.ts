import {GifResponseResolvers} from '../resolverTypes'

export type GifResponseSource = {
  id: string
  description: string
  tags: string[]
  urlOriginal: string
  urlTiny: string
  urlNano: string
}

const GifResponse: GifResponseResolvers = {
  url: (source, {size}) => {
    const {urlNano, urlOriginal, urlTiny} = source
    if (size === 'nano') return urlNano
    if (size === 'tiny') return urlTiny
    return urlOriginal
  }
}

export default GifResponse
