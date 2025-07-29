import {TableView, updateColumns} from '@tiptap/extension-table'
import type {Node as ProseMirrorNode} from '@tiptap/pm/model'

export class MenuTableView extends TableView {
  constructor(node: ProseMirrorNode, cellMinWidth: number) {
    super(node, cellMinWidth)
  }

  update(node: ProseMirrorNode): boolean {
    if (node.type !== this.node.type) {
      return false
    }
    this.node = node
    updateColumns(node, this.colgroup, this.table, this.cellMinWidth)
    return true
  }
}
