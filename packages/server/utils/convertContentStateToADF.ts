import {ContentBlock, ContentState} from 'draft-js'
import {Constants, getEntityRanges} from 'draft-js-utils'
import {isNotNull} from '../../client/utils/predicates'

const {INLINE_STYLE, BLOCK_TYPE, ENTITY_TYPE} = Constants

interface Mark {
  type: string
  attrs?: Record<string, any>
}

interface Text {
  type: 'text'
  text: string
  marks?: Mark[]
}

type InlineNode =
  | {
      type: 'emoji' | 'hardBreak' | 'inlineCard' | 'mention'
    }
  | Text

type Content = (Node | InlineNode)[]

interface Node {
  type: string
  attrs?: Record<string, any>
  content?: Content
}

export interface Doc {
  version: 1
  type: 'doc'
  content: Content
}

class ContentStateToADFConverter {
  private contentState: ContentState

  private renderText = (text: string, marks?: Mark[]): Text => ({
    type: 'text',
    text,
    ...(marks?.length ? {marks} : {})
  })

  private renderContent = (block: ContentBlock): Node[] => {
    const text = block.getText()
    const charMetaList = block.getCharacterList()
    const entityPieces = getEntityRanges(text, charMetaList) as [
      [entityKey: string, stylePieces: [text: string, style: Set<string>][]]
    ]
    const content = entityPieces.flatMap(([entityKey, stylePieces]) => {
      const contentPieces: Text[] = stylePieces
        .map(([text, style]) => {
          if (!text) {
            return null
          }

          if (style.has(INLINE_STYLE.CODE)) {
            return {
              type: 'text' as const,
              text,
              marks: [
                {
                  type: 'code'
                }
              ]
            }
          }
          const marks: Mark[] = []
          if (style.has(INLINE_STYLE.BOLD)) {
            marks.push({
              type: 'strong'
            })
          }
          if (style.has(INLINE_STYLE.UNDERLINE)) {
            marks.push({
              type: 'underline'
            })
          }
          if (style.has(INLINE_STYLE.ITALIC)) {
            marks.push({
              type: 'em'
            })
          }
          if (style.has(INLINE_STYLE.STRIKETHROUGH)) {
            marks.push({
              type: 'strike'
            })
          }
          return this.renderText(text, marks)
        })
        .filter(isNotNull)

      const entity = entityKey ? this.contentState.getEntity(entityKey) : null
      if (entity && entity.getType() === ENTITY_TYPE.LINK) {
        const data = entity.getData()
        const mark = {
          type: 'link',
          attrs: {
            href: data.href || data.url || '',
            ...(data.title ? {title: data.title} : {})
          }
        }
        return contentPieces.map((piece) => ({
          ...piece,
          marks: [mark, ...(piece.marks ?? [])]
        }))
      }
      /*
      TODO: In order to show images or other embedded types, we need to upload those separately to Jira and then refer to them by id
      else if (entity?.getType() === ENTITY_TYPE.IMAGE) {
        const data = entity.getData();
        const src = data.src || '';
        const alt = data.alt ? `${escapeTitle(data.alt)}` : '';
        return ...
      } else if (entity?.getType() === ENTITY_TYPE.EMBED) {
        const data = entity.getData()
        const url = data.url || content;
        return ...
      }
      */

      return contentPieces
    })
    return content
  }

  private renderHeader = (block: ContentBlock, level: number): Node => ({
    type: 'heading',
    attrs: {
      level
    },
    content: this.renderContent(block)
  })

  constructor(contentState: ContentState) {
    this.contentState = contentState
  }

  generate = (): Doc => {
    const blocks = this.contentState.getBlocksAsArray()

    // list items need to be nested, so store them and add them to the list once a non-list item is found
    let currentListItems: {
      type: 'listItem'
      content: any[]
    }[] = []
    let currentListType: string | null = null
    const flushList = () => {
      const type = currentListType === BLOCK_TYPE.UNORDERED_LIST_ITEM ? 'bulletList' : 'orderedList'
      const content = currentListItems
      currentListItems = []
      currentListType = null
      return {
        type,
        content
      }
    }

    const content = blocks
      .map((block) => {
        const blockType = block.getType()
        const text = block.getText()
        if (!text) {
          return null
        }

        if (blockType === currentListType) {
          currentListItems.push({
            type: 'listItem',
            // Jira wants a top level element nested in the listItem
            content: [
              {
                type: 'paragraph',
                content: this.renderContent(block)
              }
            ]
          })
          // filter out later
          return null
        }
        if (currentListType) {
          return flushList()
        }
        if (
          blockType === BLOCK_TYPE.UNORDERED_LIST_ITEM ||
          blockType === BLOCK_TYPE.ORDERED_LIST_ITEM
        ) {
          currentListType = blockType
          currentListItems = [
            {
              type: 'listItem',
              // Jira wants a top level element nested in the listItem
              content: [
                {
                  type: 'paragraph',
                  content: this.renderContent(block)
                }
              ]
            }
          ]
          // filter out later
          return null
        }

        switch (blockType) {
          case BLOCK_TYPE.HEADER_ONE:
            return this.renderHeader(block, 1)
          case BLOCK_TYPE.HEADER_TWO:
            return this.renderHeader(block, 2)
          case BLOCK_TYPE.HEADER_THREE:
            return this.renderHeader(block, 3)
          case BLOCK_TYPE.HEADER_FOUR:
            return this.renderHeader(block, 4)
          case BLOCK_TYPE.HEADER_FIVE:
            return this.renderHeader(block, 5)
          case BLOCK_TYPE.HEADER_SIX:
            return this.renderHeader(block, 6)
          case BLOCK_TYPE.BLOCKQUOTE:
            return {
              type: 'blockquote',
              content: this.renderContent(block)
            }
          case BLOCK_TYPE.CODE:
            return {
              type: 'codeBlock',
              content: this.renderContent(block)
            }
          case BLOCK_TYPE.ATOMIC:
          case BLOCK_TYPE.UNSTYLED:
          default:
            return {
              type: 'paragraph',
              content: this.renderContent(block)
            }
        }
      })
      .filter((contentBlock) => contentBlock !== null) as Node[]
    // flush the list if the document stopped with one
    if (currentListType) {
      content.push(flushList())
    }

    return {
      version: 1,
      type: 'doc',
      content
    }
  }
}

const convertContentStateToADF = (contentState: ContentState) => {
  return new ContentStateToADFConverter(contentState).generate()
}

export default convertContentStateToADF
