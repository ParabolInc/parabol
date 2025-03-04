import {
  combineTransactionSteps,
  Extension,
  findChildrenInRange,
  getChangedRanges
} from '@tiptap/core'
import {Fragment, Node, Slice} from '@tiptap/pm/model'
import {Plugin, PluginKey, Transaction} from '@tiptap/pm/state'

function getUniqueItems<T>(items: T[], serialize: (item: T) => string = JSON.stringify): T[] {
  const seen: Record<string, boolean> = {}
  return items.filter((item) => {
    const key = serialize(item)
    if (seen[key]) return false
    seen[key] = true
    return true
  })
}

interface UniqueIDOptions {
  attributeName: string
  types: string[]
  generateID: () => string
  filterTransaction?: ((transaction: Transaction) => boolean) | null
}

export const UniqueID = Extension.create<UniqueIDOptions>({
  name: 'uniqueID',
  priority: 10000,
  addOptions: () => ({
    attributeName: 'id',
    types: [],
    generateID: () => crypto.randomUUID(),
    filterTransaction: null
  }),
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          [this.options.attributeName]: {
            default: null,
            parseHTML: (element: HTMLElement) =>
              element.getAttribute(`data-${this.options.attributeName}`),
            renderHTML: (attributes: Record<string, any>) =>
              attributes[this.options.attributeName]
                ? {[`data-${this.options.attributeName}`]: attributes[this.options.attributeName]}
                : {}
          }
        }
      }
    ]
  },
  addProseMirrorPlugins() {
    let draggedElement: HTMLElement | null = null
    let shouldTransformPaste = false
    const options = this.options
    return [
      new Plugin({
        key: new PluginKey('uniqueID'),
        appendTransaction: (transactions, oldState, newState) => {
          const docChanged =
            transactions.some((tr) => tr.docChanged) && !oldState.doc.eq(newState.doc)
          const filtered =
            options.filterTransaction && transactions.some((tr) => !options.filterTransaction!(tr))
          const ySyncTransaction = transactions.find((tr) => tr.getMeta('y-sync$'))
          if (ySyncTransaction || !docChanged || filtered) return

          const {tr} = newState
          const {types, attributeName, generateID} = options

          const changes = combineTransactionSteps(oldState.doc, transactions as Transaction[])
          const {mapping} = changes

          getChangedRanges(changes).forEach(({newRange}) => {
            const nodes = findChildrenInRange(newState.doc, newRange, (node) =>
              types.includes(node.type.name)
            )
            const existingIDs = nodes
              .map(({node}) => node.attrs[attributeName])
              .filter((id) => id !== null)

            nodes.forEach(({node, pos}, index) => {
              const existingID = tr.doc.nodeAt(pos)?.attrs[attributeName]
              if (existingID === null) {
                tr.setNodeMarkup(pos, undefined, {...node.attrs, [attributeName]: generateID()})
              }

              const nextNode = nodes[index + 1]
              if (nextNode && node.content.size === 0) {
                tr.setNodeMarkup(nextNode.pos, undefined, {
                  ...nextNode.node.attrs,
                  [attributeName]: existingID
                })
                existingIDs[index + 1] = existingID
                if (!nextNode.node.attrs[attributeName]) {
                  const newID = generateID()
                  tr.setNodeMarkup(pos, undefined, {...node.attrs, [attributeName]: newID})
                  existingIDs[index] = newID
                }
              }

              const uniqueIDs = getUniqueItems(existingIDs)
              const {deleted} = mapping.invert().mapResult(pos)
              if (deleted && uniqueIDs.includes(existingID)) {
                tr.setNodeMarkup(pos, undefined, {...node.attrs, [attributeName]: generateID()})
              }
            })
          })
          return tr.steps.length ? tr : undefined
        },
        view(editorView) {
          const onDragStart = (event: DragEvent) => {
            draggedElement = editorView.dom.parentElement?.contains(event.target as HTMLElement)
              ? editorView.dom.parentElement
              : null
          }
          window.addEventListener('dragstart', onDragStart)
          return {
            destroy() {
              window.removeEventListener('dragstart', onDragStart)
            }
          }
        },
        props: {
          handleDOMEvents: {
            drop(view, event) {
              if (
                draggedElement === view.dom.parentElement &&
                event.dataTransfer?.effectAllowed !== 'copy'
              ) {
                draggedElement = null
                shouldTransformPaste = true
              }
              return false
            },
            paste() {
              shouldTransformPaste = true
              return false
            }
          },
          transformPasted(slice) {
            if (!shouldTransformPaste) return slice
            shouldTransformPaste = false
            const {types, attributeName} = options
            const transformNodes = (fragment: Fragment): Fragment => {
              const children: Node[] = []
              fragment.forEach((node) => {
                if (node.isText) {
                  children.push(node)
                } else if (types.includes(node.type.name)) {
                  children.push(
                    node.type.create(
                      {...node.attrs, [attributeName]: null},
                      transformNodes(node.content),
                      node.marks
                    )
                  )
                } else {
                  children.push(node.copy(transformNodes(node.content)))
                }
              })
              return Fragment.from(children)
            }
            return new Slice(transformNodes(slice.content), slice.openStart, slice.openEnd)
          }
        }
      })
    ]
  }
})
