import type {Editor, JSONContent} from '@tiptap/core'
import {GraphQLError} from 'graphql'
import {isParabolHostedAsset} from '../../fileStorage/isParabolHostedAsset'

const badInput = (message: string) =>
  new GraphQLError(message, {extensions: {code: 'BAD_USER_INPUT'}})

const findImageBlocks = (nodes: JSONContent[]): JSONContent[] =>
  nodes.flatMap((node) => [
    ...(node.type === 'imageBlock' ? [node] : []),
    ...findImageBlocks(node.content ?? [])
  ])

export const collectImageSrcs = (nodes: JSONContent[]) =>
  findImageBlocks(nodes).flatMap(({attrs}) => (typeof attrs?.src === 'string' ? [attrs.src] : []))

export const validatePageDoc = (
  editor: Editor,
  doc: JSONContent,
  allowedImageSrcs: Set<string>
) => {
  try {
    editor.schema.nodeFromJSON(doc).check()
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e)
    throw badInput(`The content is not a valid page: ${reason}`)
  }
  for (const {attrs} of findImageBlocks(doc.content ?? [])) {
    const src = attrs?.src
    if (typeof src !== 'string' || !src) throw badInput('An image needs a src URL')
    if (!isParabolHostedAsset(src) && !allowedImageSrcs.has(src)) {
      throw badInput(
        `The image ${src} is not hosted by Parabol. Upload it first with upload_image and use the URL it returns`
      )
    }
  }
}
