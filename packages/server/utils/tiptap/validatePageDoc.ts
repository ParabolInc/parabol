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
  let root: ReturnType<typeof editor.schema.nodeFromJSON>
  try {
    root = editor.schema.nodeFromJSON(doc)
    root.check()
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e)
    throw badInput(`The content is not a valid page: ${reason}`)
  }
  if (root.type !== editor.schema.topNodeType) {
    throw badInput('The content must be a whole page, a doc node')
  }
  for (const {attrs} of findImageBlocks(doc.content ?? [])) {
    const src = attrs?.src
    if (typeof src !== 'string' || !src)
      throw badInput('An image needs a src URL. Remove the empty ![]() image or give it a URL')
    if (!isParabolHostedAsset(src) && !allowedImageSrcs.has(src)) {
      throw badInput(
        `The image ${src} is not hosted by Parabol. Upload it to Parabol first (the uploadUserAsset or embedUserAsset mutation, or the upload_image tool) and use the URL it returns`
      )
    }
  }
}
