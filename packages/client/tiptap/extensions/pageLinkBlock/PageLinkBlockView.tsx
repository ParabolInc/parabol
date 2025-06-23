import DescriptionIcon from '@mui/icons-material/Description'
import FileOpenIcon from '@mui/icons-material/FileOpen'
import {NodeViewWrapper, type NodeViewProps} from '@tiptap/react'
import {Link} from 'react-router-dom'
import {getPageSlug} from '../../getPageSlug'

export const PageLinkBlockView = (props: NodeViewProps) => {
  const {node} = props
  const {attrs} = node
  const {pageId, title, auto} = attrs
  const pageSlug = getPageSlug(pageId, title)
  const Icon = auto ? DescriptionIcon : FileOpenIcon
  return (
    // ProseMirror-selectednode goes away if the cursor is in between nodes, which is what we want
    <NodeViewWrapper className={'group-[.ProseMirror-selectednode]:bg-slate-200'}>
      <Link
        to={`/pages/${pageSlug}`}
        className='flex w-full items-center rounded-sm p-1 no-underline! transition-colors hover:bg-slate-100'
      >
        <Icon />
        <span className='pl-1'>{title}</span>
      </Link>
    </NodeViewWrapper>
  )
}
