import {type NodeViewProps, NodeViewWrapper} from '@tiptap/react'
import {useCallback, useEffect, useRef} from 'react'
import {isAllowedEmbedHost, resolveCuratedEmbed} from '../../../shared/embed/curatedEmbedProviders'
import type {EmbedBlockAttrs} from '../../../shared/embed/embedTypes'
import {normalizeEmbedUrl} from '../../../shared/embed/normalizeEmbedUrl'
import {cn} from '../../../ui/cn'
import {EmbedBlockCard} from './EmbedBlockCard'
import {EmbedBlockFrame} from './EmbedBlockFrame'
import {EmbedBlockUrlInput} from './EmbedBlockUrlInput'
import {useResolveEmbedUrl} from './useResolveEmbedUrl'

export const EmbedBlockView = (props: NodeViewProps) => {
  const {editor, getPos, node, updateAttributes, selected} = props
  const attrs = node.attrs as EmbedBlockAttrs
  const {
    url,
    displayMode,
    align,
    width,
    isFullWidth,
    aspectRatio,
    embedSrc,
    title,
    thumbnailUrl,
    fetchedAt
  } = attrs

  const [resolve, isResolving] = useResolveEmbedUrl()
  const resolvedUrlRef = useRef<string | null>(null)

  const onClick = useCallback(() => {
    const pos = getPos()
    if (pos === undefined) return
    editor.commands.setNodeSelection(pos)
  }, [getPos, editor])

  const applyResolvedMetadata = useCallback(
    (resolved: Awaited<ReturnType<typeof resolve>>) => {
      if (!resolved) {
        updateAttributes({displayMode: 'card', fetchedAt: new Date().toISOString()})
        return
      }
      const {aspectRatio: resolvedAspect, url: _url, ...metadata} = resolved
      updateAttributes({
        ...metadata,
        ...(resolvedAspect && {aspectRatio: resolvedAspect}),
        ...(!resolved.embedSrc && {displayMode: 'card'})
      })
    },
    [updateAttributes]
  )

  const applyUrl = useCallback(
    async (raw: string) => {
      const normalized = normalizeEmbedUrl(raw)
      if (!normalized) return
      // Curated providers resolve with no round-trip, so the embed paints immediately
      const curated = resolveCuratedEmbed(normalized)
      if (curated) {
        updateAttributes({
          url: normalized,
          embedSrc: curated.embedSrc,
          providerName: curated.providerName,
          aspectRatio: curated.aspectRatio,
          displayMode: 'embed',
          fetchedAt: new Date().toISOString()
        })
        return
      }
      // Clear the previous provider's metadata up front, so a failed resolve cannot
      // leave the old title and thumbnail sitting next to the new URL
      updateAttributes({
        url: normalized,
        embedSrc: undefined,
        title: undefined,
        description: undefined,
        thumbnailUrl: undefined,
        faviconUrl: undefined,
        providerName: undefined,
        authorName: undefined
      })
      const resolved = await resolve(normalized)
      applyResolvedMetadata(resolved)
    },
    [updateAttributes, resolve, applyResolvedMetadata]
  )

  // A URL can arrive already on the node, from a paste or a collaborator, without
  // ever passing through applyUrl. An unstamped fetchedAt is the signal it was
  // never resolved.
  useEffect(() => {
    if (!url || fetchedAt) return
    if (!editor.isEditable) return
    if (resolvedUrlRef.current === url) return
    resolvedUrlRef.current = url

    const curated = resolveCuratedEmbed(url)
    if (curated) {
      updateAttributes({
        embedSrc: curated.embedSrc,
        providerName: curated.providerName,
        aspectRatio: curated.aspectRatio,
        displayMode: 'embed',
        fetchedAt: new Date().toISOString()
      })
      return
    }

    let cancelled = false
    resolve(url).then((resolved) => {
      if (!cancelled) applyResolvedMetadata(resolved)
    })
    return () => {
      cancelled = true
    }
  }, [url, fetchedAt, editor.isEditable, resolve, applyResolvedMetadata, updateAttributes])

  const alignClass =
    align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center'

  if (!url) {
    return (
      <NodeViewWrapper>
        <div contentEditable={false}>
          <EmbedBlockUrlInput isResolving={isResolving} onSubmit={applyUrl} />
        </div>
      </NodeViewWrapper>
    )
  }

  // embedSrc lives in a Yjs doc, so a collaborator can write it directly over the
  // websocket. Re-check it here rather than trusting what the resolver stored.
  const canFrame = displayMode === 'embed' && isAllowedEmbedHost(embedSrc)

  return (
    <NodeViewWrapper>
      <div className={cn('flex', alignClass)}>
        <div
          contentEditable={false}
          onClick={onClick}
          className={cn('group relative', isFullWidth || !width ? 'w-full' : undefined)}
          style={isFullWidth || !width ? undefined : {width}}
        >
          {canFrame ? (
            <EmbedBlockFrame
              embedSrc={embedSrc!}
              title={title || url}
              aspectRatio={aspectRatio}
              thumbnailUrl={thumbnailUrl}
              // A cross-origin iframe swallows mousemove, so while it is live the editor
              // never learns the pointer is over this block and the drag handle stays
              // hidden. Letting pointer events fall through to the in-flow container
              // until the block is selected restores both the handle and click-to-select.
              isInert={editor.isEditable && !selected}
            />
          ) : (
            <EmbedBlockCard attrs={attrs} />
          )}
        </div>
      </div>
    </NodeViewWrapper>
  )
}

export default EmbedBlockView
