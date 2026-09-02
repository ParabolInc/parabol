import graphql from 'babel-plugin-relay/macro'
import {useCallback, useState} from 'react'
import {fetchQuery} from 'relay-runtime'
import type {useResolveEmbedUrlQuery} from '../../../__generated__/useResolveEmbedUrlQuery.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import type {EmbedBlockProviderAttrs} from '../../../shared/embed/embedTypes'

const query = graphql`
  query useResolveEmbedUrlQuery($url: String!, $refresh: Boolean) {
    resolveEmbedUrl(url: $url, refresh: $refresh) {
      url
      embedSrc
      title
      description
      thumbnailUrl
      faviconUrl
      providerName
      authorName
      aspectRatio
      fetchedAt
    }
  }
`

type Resolved = EmbedBlockProviderAttrs & {url: string; aspectRatio?: string}

export const useResolveEmbedUrl = () => {
  const atmosphere = useAtmosphere()
  const [isResolving, setIsResolving] = useState(false)

  const resolve = useCallback(
    async (url: string, refresh?: boolean): Promise<Resolved | null> => {
      setIsResolving(true)
      try {
        const data = await fetchQuery<useResolveEmbedUrlQuery>(atmosphere, query, {
          url,
          refresh
        }).toPromise()
        const result = data?.resolveEmbedUrl
        if (!result) return null
        return {
          url: result.url,
          embedSrc: result.embedSrc ?? undefined,
          title: result.title ?? undefined,
          description: result.description ?? undefined,
          thumbnailUrl: result.thumbnailUrl ?? undefined,
          faviconUrl: result.faviconUrl ?? undefined,
          providerName: result.providerName ?? undefined,
          authorName: result.authorName ?? undefined,
          aspectRatio: result.aspectRatio ?? undefined,
          fetchedAt: result.fetchedAt ?? new Date().toISOString()
        }
      } catch {
        // a transport failure leaves the caller to fall back to a bare card
        return null
      } finally {
        setIsResolving(false)
      }
    },
    [atmosphere]
  )

  return [resolve, isResolving] as const
}
