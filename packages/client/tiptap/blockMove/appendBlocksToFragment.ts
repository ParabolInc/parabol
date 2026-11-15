import type {JSONContent} from '@tiptap/core'
import type {Schema} from '@tiptap/pm/model'
import {prosemirrorJSONToYXmlFragment} from '@tiptap/y-tiptap'
import * as Y from 'yjs'

export type MovedBlock = {client: number; clock: number; snapshot: string}

const isEmptyParagraph = (node: ReturnType<Y.XmlFragment['get']> | undefined) =>
  node instanceof Y.XmlElement && node.nodeName === 'paragraph' && node.length === 0

export const appendBlocksToFragment = (
  frag: Y.XmlFragment,
  blocks: JSONContent[],
  schema: Schema
): MovedBlock[] => {
  const scratch = new Y.Doc()
  const scratchFrag = scratch.getXmlFragment('default')
  prosemirrorJSONToYXmlFragment(
    schema,
    {type: 'doc', content: [{type: 'heading', attrs: {level: 1}}, ...blocks]},
    scratchFrag
  )
  const clones = scratchFrag
    .toArray()
    .slice(1)
    .filter((child) => child instanceof Y.XmlElement || child instanceof Y.XmlText)
    .map((child) => child.clone())
  const moved: MovedBlock[] = []
  const insert = () => {
    const last = frag.length > 0 ? frag.get(frag.length - 1) : undefined
    const index = frag.length > 1 && isEmptyParagraph(last) ? frag.length - 1 : frag.length
    frag.insert(index, clones)
    clones.forEach((clone) => {
      const id = clone._item!.id
      moved.push({client: id.client, clock: id.clock, snapshot: clone.toString()})
    })
  }
  if (frag.doc) frag.doc.transact(insert)
  else insert()
  return moved
}
