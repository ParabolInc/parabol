import {generateText, mergeAttributes, type JSONContent} from '@tiptap/core'
import BaseLink from '@tiptap/extension-link'
import Mention from '@tiptap/extension-mention'
import {generateJSON} from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import {convertFromRaw, RawDraftContentState} from 'draft-js'
import {Options, stateToHTML} from 'draft-js-export-html'
import type {Kysely} from 'kysely'

const serverTipTapExtensions = [
  StarterKit,
  Mention.configure({
    renderText({node}) {
      return node.attrs.label
    },
    renderHTML({options, node}) {
      return ['span', options.HTMLAttributes, `${node.attrs.label ?? node.attrs.id}`]
    }
  }),
  BaseLink.extend({
    parseHTML() {
      return [
        {
          tag: 'a[href]:not([data-type="button"]):not([href *= "javascript:" i])'
        }
      ]
    },

    renderHTML({HTMLAttributes}) {
      return [
        'a',
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
          class: 'link'
        }),
        0
      ]
    }
  })
]

const getNameFromEntity = (content: RawDraftContentState, userId: string) => {
  const {blocks, entityMap} = content
  const entityKey = Number(
    Object.keys(entityMap).find((key) => entityMap[key]!.data?.userId === userId)
  )
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]!
    const {entityRanges, text} = block
    const entityRange = entityRanges.find((range) => range.key === entityKey)
    if (!entityRange) continue
    const {length, offset} = entityRange
    return text.slice(offset, offset + length)
  }
  console.log('found unknown for', userId, JSON.stringify(content))
  return 'Unknown User'
}

const getTrimmedContent = (content: JSONContent) => {
  const contentStr = JSON.stringify(content)
  if (contentStr.length <= 2000) return contentStr
  const plaintextContent = generateText(content, serverTipTapExtensions)
  const plainJSONContent = generateJSON(`<p>${plaintextContent}</p>`, serverTipTapExtensions)
  return JSON.stringify(plainJSONContent)
}

export const convertKnownDraftToTipTap = (content: RawDraftContentState) => {
  const contentState = convertFromRaw(content)
  const options: Options = {
    entityStyleFn: (entity) => {
      const entityType = entity.getType().toLowerCase()
      const data = entity.getData()
      if (entityType === 'tag') {
        return {
          element: 'span',
          attributes: {
            'data-id': data.value,
            'data-type': 'taskTag'
          }
        }
      }
      if (entityType === 'mention') {
        const label = getNameFromEntity(content, data.userId)
        return {
          element: 'span',
          attributes: {
            'data-id': data.userId.toWellFormed(),
            'data-label': label.toWellFormed(),
            'data-type': 'mention'
          }
        }
      }
      return
    }
  }
  const html = stateToHTML(contentState, options)
  const json = generateJSON(html, serverTipTapExtensions)
  return json
}

export async function up(db: Kysely<any>): Promise<void> {
  let lastId = ''

  for (let i = 0; i < 1e6; i++) {
    const reflections = await db
      .selectFrom('RetroReflection')
      .select(['id', 'content'])
      .where('id', '>', lastId)
      .orderBy('id asc')
      .limit(1000)
      .execute()
    console.log('converting reflections', i * 1000)
    if (reflections.length === 0) break
    const updatePromises = [] as Promise<any>[]
    for (const reflection of reflections) {
      const {id, content: contentStr} = reflection
      let content
      try {
        content = JSON.parse(contentStr)
      } catch {
        console.log('invalid json found')
        continue
      }
      if ('blocks' in content) {
        // this is draftjs
        const tipTapContent = convertKnownDraftToTipTap(content)
        const trimmedContentStr = getTrimmedContent(tipTapContent)

        const doPromise = async () => {
          try {
            return await db
              .updateTable('RetroReflection')
              .set({content: trimmedContentStr})
              .where('id', '=', id)
              .execute()
          } catch (e) {
            console.log('GOT ERR', id, trimmedContentStr, e)
            throw e
          }
        }
        updatePromises.push(doPromise())
      }
    }
    await Promise.all(updatePromises)
    lastId = reflections.at(-1)!.id
  }
}

export async function down(db: Kysely<any>): Promise<void> {}
