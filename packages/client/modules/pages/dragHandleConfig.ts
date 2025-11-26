import type {DragHandleOptions} from '@tiptap/extension-drag-handle'
import type {Node} from '@tiptap/pm/model'
import graphql from 'babel-plugin-relay/macro'
import {commitLocalUpdate} from 'relay-runtime'
import type {dragHandleConfigQuery as DragHandleConfigQuery} from '~/__generated__/dragHandleConfigQuery.graphql'
import type Atmosphere from '../../Atmosphere'
import {GQLID} from '../../utils/GQLID'

const queryNode = graphql`
  query dragHandleConfigQuery($pageId: ID!) {
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
const dragHandleElement = document.createElement('div')
let dragHandleNode: Node | null = null

export const dragHandleConfig = (atmosphere: Atmosphere, pageId: string) =>
  ({
    // drag-handle-react breaks when clicking pageLinkBlocks because it removes a react child w/o telling react
    // So we do this outside of react
    onElementDragStart: async () => {
      if (!dragHandleNode) return
      if (dragHandleNode.type.name !== 'pageLinkBlock') return
      const {pageCode} = dragHandleNode.attrs
      const pageKey = GQLID.toKey(pageCode, 'page')
      const res = await atmosphere.fetchQuery<DragHandleConfigQuery>(queryNode, {pageId: pageKey})
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
    onElementDragEnd: () => {
      console.log('onElementDragEnd set draggingPageId to null')
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
  }) as DragHandleOptions
