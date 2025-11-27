import {Extension} from '@tiptap/core'
import DragHandle from '@tiptap/extension-drag-handle'
import type {Node} from '@tiptap/pm/model'
import graphql from 'babel-plugin-relay/macro'
import {commitLocalUpdate} from 'relay-runtime'
import type {PageDragHandleQuery} from '../../../__generated__/PageDragHandleQuery.graphql'
import type Atmosphere from '../../../Atmosphere'
import {GQLID} from '../../../utils/GQLID'

const queryNode = graphql`
  query PageDragHandleQuery($pageId: ID!) {
    public {
      page(pageId: $pageId) {
        isPrivate
        access {
          viewer
        }
      }
    }
  }
`

function isEmptyParagraph(node: Node) {
  return node.type.name === 'paragraph' && node.textContent.length === 0
}

type Options = {
  atmosphere: Atmosphere
  pageId: string
}
export const PageDragHandle = Extension.create<Options>({
  name: 'PageDragHandle',

  addExtensions() {
    const dragHandleElement = document.createElement('div')
    let dragHandleNode: Node | null = null
    const {atmosphere, pageId} = this.options
    return [
      DragHandle.configure({
        // drag-handle-react breaks when clicking pageLinkBlocks because it removes a react child w/o telling react
        // So we do this outside of react
        onElementDragStart: async (e) => {
          if (!dragHandleNode) return
          if (dragHandleNode.type.name !== 'pageLinkBlock') return
          const {pageCode} = dragHandleNode.attrs
          const pageKey = GQLID.toKey(pageCode, 'page')
          e.dataTransfer!.setData('text/plain', '__dummy__')
          e.dataTransfer!.effectAllowed = 'copyMove'
          const res = await atmosphere.fetchQuery<PageDragHandleQuery>(queryNode, {
            pageId: pageKey
          })
          // if the node changed, abort
          if (pageCode !== dragHandleNode?.attrs.pageCode) return
          if (res instanceof Error) return
          const {page} = res.public
          if (!page) return
          const {access, isPrivate} = page
          const draggingPageViewerAccess = access.viewer
          // we need to get all the info from the server probably
          const sourceConnectionKey = 'User_pages'
          const sourceParentPageId = pageId
          const draggingPageParentSection = `${sourceConnectionKey}:${sourceParentPageId}`

          commitLocalUpdate(atmosphere, (store) => {
            store
              .getRoot()
              .getLinkedRecord('viewer')
              ?.setValue(pageKey, 'draggingPageId')
              .setValue(isPrivate, 'draggingPageIsPrivate')
              .setValue(draggingPageParentSection, 'draggingPageParentSection')
              .setValue(draggingPageViewerAccess, 'draggingPageViewerAccess')
            const parentId = sourceParentPageId
            const parent = parentId ? store.get(parentId) : null
            parent?.setValue(false, 'isDraggingFirstChild').setValue(false, 'isDraggingLastChild')
          })
        },
        onElementDragEnd: (e) => {
          e.preventDefault()
          commitLocalUpdate(atmosphere, (store) => {
            store
              .getRoot()
              .getLinkedRecord('viewer')
              ?.setValue(null, 'draggingPageId')
              .setValue(null, 'draggingPageIsPrivate')
              .setValue(null, 'draggingPageParentSection')
              .setValue(null, 'draggingPageViewerAccess')
            const parent = store.get(pageId)
            parent?.setValue(null, 'isDraggingFirstChild').setValue(null, 'isDraggingLastChild')
          })
        },
        render: () => {
          dragHandleElement.classList.add('drag-handle', 'hide')
          return dragHandleElement
        },
        onNodeChange: ({node}) => {
          dragHandleNode = node
          const isEmpty = node ? isEmptyParagraph(node) : false
          const isHidden = dragHandleElement.classList.contains('hide')
          if (isEmpty !== isHidden) {
            if (isEmpty) {
              dragHandleElement.classList.add('hide')
            } else {
              dragHandleElement.classList.remove('hide')
            }
          }
        }
      })
    ]
  }
})
