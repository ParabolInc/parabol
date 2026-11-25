import {getSchema, type JSONContent} from '@tiptap/core'
import type {Node} from '@tiptap/pm/model'
import {GraphQLError} from 'graphql'
import {getAllNodesAttributesByType} from '../../../client/shared/tiptap/getAllNodesAttributesByType'
import {serverTipTapExtensions} from '../../../client/shared/tiptap/serverTipTapExtensions'
import {isParabolHostedAsset} from '../../fileStorage/isParabolHostedAsset'

const schema = getSchema(serverTipTapExtensions)

const badInput = (message: string) =>
  new GraphQLError(message, {extensions: {code: 'BAD_USER_INPUT'}})

export const validatePageDoc = (doc: JSONContent, allowedImageSrcs: Set<string>) => {
  let root: Node
  try {
    root = schema.nodeFromJSON(doc)
    root.check()
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e)
    throw badInput(`The content is not a valid page: ${reason}`)
  }
  if (root.type !== schema.topNodeType) {
    throw badInput('The content must be a whole page, a doc node')
  }
  for (const attrs of getAllNodesAttributesByType<{src?: unknown}>(doc, 'imageBlock')) {
    const src = attrs?.src
    if (typeof src !== 'string' || !src)
      throw badInput('An image needs a src URL. Remove the image or give it a URL')
    if (!isParabolHostedAsset(src) && !allowedImageSrcs.has(src)) {
      throw badInput(
        `The image ${src} is not hosted by Parabol. Upload it with uploadUserAsset or embedUserAsset and use the URL it returns`
      )
    }
  }
}
