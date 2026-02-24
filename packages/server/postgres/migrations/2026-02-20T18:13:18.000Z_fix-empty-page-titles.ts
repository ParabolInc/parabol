import type {Kysely} from 'kysely'
import {applyUpdate, Doc, encodeStateAsUpdate, XmlElement, XmlText} from 'yjs'

const getBlockText = (node: XmlElement): string => {
  let text = ''
  for (const child of node.toArray()) {
    if (child instanceof XmlText) {
      text += child.toJSON()
    } else if (child instanceof XmlElement) {
      text += getBlockText(child)
    }
  }
  return text
}

export async function up(db: Kysely<any>): Promise<void> {
  const pages = await db
    .selectFrom('Page')
    .select(['id', 'yDoc', 'plaintextContent'])
    .where('summaryMeetingId', 'is not', null)
    .where('title', '=', '')
    .where('deletedAt', 'is', null)
    .execute()

  console.log(`Found ${pages.length} meeting summary pages with empty titles`)
  if (pages.length === 0) return

  let fixedCount = 0
  let skippedCount = 0

  for (const {id: pageId, yDoc, plaintextContent} of pages) {
    if (!yDoc) {
      skippedCount++
      continue
    }

    const doc = new Doc()
    applyUpdate(doc, yDoc)
    const frag = doc.getXmlFragment('default')
    const children = frag.toArray()

    // Find the first non-empty block
    let emptyCount = 0
    for (const child of children) {
      if (!(child instanceof XmlElement)) break
      if (getBlockText(child).trim() !== '') break
      emptyCount++
    }

    if (emptyCount === 0 || emptyCount >= children.length) {
      skippedCount++
      continue
    }

    // Check if the first non-empty block is a heading level 1
    const titleBlock = children[emptyCount]
    if (!(titleBlock instanceof XmlElement)) {
      skippedCount++
      continue
    }
    if (titleBlock.nodeName !== 'heading' || Number(titleBlock.getAttribute('level')) !== 1) {
      skippedCount++
      continue
    }

    // Delete all leading empty blocks
    frag.delete(0, emptyCount)

    // Re-extract title and plaintext from the updated doc
    const title = getBlockText(titleBlock).slice(0, 255)

    await db
      .updateTable('Page')
      .set({
        yDoc: Buffer.from(encodeStateAsUpdate(doc)),
        title,
        plaintextContent: plaintextContent.trim()
      })
      .where('id', '=', pageId)
      .execute()

    fixedCount++
  }

  console.log(`Migration complete: ${fixedCount} fixed, ${skippedCount} skipped`)
}

export async function down(_db: Kysely<any>): Promise<void> {
  // noop
}
