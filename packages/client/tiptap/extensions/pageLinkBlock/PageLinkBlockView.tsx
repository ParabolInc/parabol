import DescriptionIcon from '@mui/icons-material/Description'
import {NodeViewWrapper, type NodeViewProps} from '@tiptap/react'
import {Link} from 'react-router-dom'
export const PageLinkBlockView = (props: NodeViewProps) => {
  const {node} = props
  const {attrs} = node
  const {pageId, title} = attrs

  return (
    <NodeViewWrapper>
      <Link
        to={`/pages/${pageId}`}
        className='flex w-full items-center rounded-sm p-1 no-underline! transition-colors hover:bg-slate-200'
      >
        <DescriptionIcon />
        <div className='pl-1'>{title}</div>
      </Link>
    </NodeViewWrapper>
  )
}
