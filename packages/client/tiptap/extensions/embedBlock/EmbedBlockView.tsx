import {type NodeViewProps, NodeViewWrapper} from '@tiptap/react'
import {useCallback} from 'react'
import {isAllowedEmbedHost, resolveCuratedEmbed} from '../../../shared/embed/curatedEmbedProviders'
import type {EmbedBlockAttrs} from '../../../shared/embed/embedTypes'
import {normalizeEmbedUrl} from '../../../shared/embed/normalizeEmbedUrl'
import {cn} from '../../../ui/cn'
import {EmbedBlockCard} from './EmbedBlockCard'
import {EmbedBlockFrame} from './EmbedBlockFrame'
import {EmbedBlockUrlInput} from './EmbedBlockUrlInput'

export const EmbedBlockView = (props: NodeViewProps) => {
  const {editor, getPos, node, updateAttributes, selected} = props
  const attrs = node.attrs as EmbedBlockAttrs
  const {url, displayMode, align, width, isFullWidth, aspectRatio, embedSrc, title, thumbnailUrl} =
    attrs

  const onClick = useCallback(() => {
    const pos = getPos()
    if (pos === undefined) return
    editor.commands.setNodeSelection(pos)
  }, [getPos, editor])

  const onSubmitUrl = useCallback(
    (raw: string) => {
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
      // Nothing more can be learned about this URL yet, so the card renders from the
      // URL alone and fetchedAt stays unset for a later resolver to pick up
      updateAttributes({url: normalized, displayMode: 'card'})
    },
    [updateAttributes]
  )

  const alignClass =
    align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center'

  if (!url) {
    return (
      <NodeViewWrapper>
        <div contentEditable={false}>
          <EmbedBlockUrlInput isResolving={false} onSubmit={onSubmitUrl} />
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
