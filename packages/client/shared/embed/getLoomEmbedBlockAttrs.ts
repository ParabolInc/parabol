import {resolveCuratedEmbed} from './curatedEmbedProviders'

export const getLoomEmbedBlockAttrs = (url: string) => {
  const curated = resolveCuratedEmbed(url)
  return {
    url,
    displayMode: 'embed',
    align: 'center',
    aspectRatio: curated?.aspectRatio ?? '16:9',
    ...(curated && {embedSrc: curated.embedSrc, providerName: curated.providerName})
  }
}
