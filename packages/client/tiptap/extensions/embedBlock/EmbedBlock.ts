import {Plugin, PluginKey} from '@tiptap/pm/state'
import {ReactNodeViewRenderer} from '@tiptap/react'
import {resolveCuratedEmbed} from '../../../shared/embed/curatedEmbedProviders'
import {normalizeEmbedUrl} from '../../../shared/embed/normalizeEmbedUrl'
import {EmbedBlockBase} from '../../../shared/tiptap/extensions/EmbedBlockBase'
import {EmbedBlockView} from './EmbedBlockView'

export const EmbedBlock = EmbedBlockBase.extend({
  addCommands() {
    return {
      setEmbedBlock:
        (attributes) =>
        ({commands}) => {
          const {url, pos} = attributes ?? {}
          const curated = url ? resolveCuratedEmbed(url) : null
          const node = {
            type: 'embedBlock',
            attrs: {
              url: url ?? '',
              ...(curated && {
                embedSrc: curated.embedSrc,
                providerName: curated.providerName,
                aspectRatio: curated.aspectRatio
              })
            }
          }
          if (pos !== undefined) return commands.insertContentAt(pos, node)
          return commands.insertContent(node)
        },
      setEmbedBlockAlign:
        (align) =>
        ({commands}) =>
          commands.updateAttributes('embedBlock', {align}),
      setEmbedBlockWidth:
        (width) =>
        ({commands}) =>
          commands.updateAttributes('embedBlock', {width, isFullWidth: false}),
      setEmbedBlockFullWidth:
        (isFullWidth) =>
        ({commands}) =>
          commands.updateAttributes('embedBlock', {isFullWidth}),
      setEmbedBlockDisplayMode:
        (displayMode) =>
        ({commands}) =>
          commands.updateAttributes('embedBlock', {displayMode}),
      setEmbedBlockAspectRatio:
        (aspectRatio) =>
        ({commands}) =>
          commands.updateAttributes('embedBlock', {aspectRatio}),
      setEmbedBlockMetadata:
        (metadata) =>
        ({commands}) =>
          commands.updateAttributes('embedBlock', metadata)
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('embedBlockPaste'),
        props: {
          handlePaste: (view, event) => {
            const text = event.clipboardData?.getData('text/plain')?.trim()
            if (!text) return false
            const url = normalizeEmbedUrl(text)
            if (!url) return false
            const {selection, schema} = view.state
            // Only claim the paste when it cannot be meant as a link: an empty
            // selection sitting alone in an empty paragraph. Pasting over text
            // must still produce a link mark.
            if (!selection.empty) return false
            const {$from} = selection
            const parent = $from.parent
            if (parent.type.name !== 'paragraph' || parent.content.size !== 0) return false
            // Only a top-level paragraph. A paragraph nested in a table cell, list item
            // or details block may not accept a block node, and replaceSelectionWith
            // would then place it somewhere surprising.
            if ($from.depth !== 1) return false
            const nodeType = schema.nodes.embedBlock
            if (!nodeType) return false
            const curated = resolveCuratedEmbed(url)
            const node = nodeType.create({
              url,
              ...(curated && {
                embedSrc: curated.embedSrc,
                providerName: curated.providerName,
                aspectRatio: curated.aspectRatio
              })
            })
            const tr = view.state.tr.replaceSelectionWith(node)
            view.dispatch(tr.scrollIntoView())
            return true
          }
        }
      })
    ]
  },

  addNodeView() {
    // By convention, components rendered here are named with a *View suffix
    return ReactNodeViewRenderer(EmbedBlockView, {className: 'group'})
  }
})

export default EmbedBlock
