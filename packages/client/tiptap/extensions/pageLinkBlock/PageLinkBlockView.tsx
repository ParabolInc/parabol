import DescriptionIcon from '@mui/icons-material/Description'
import {NodeViewWrapper, type NodeViewProps} from '@tiptap/react'
import {Link} from 'react-router-dom'
import {getPageSlug} from '../../getPageSlug'
export const PageLinkBlockView = (props: NodeViewProps) => {
  const {node} = props
  const {attrs} = node
  const {pageId, title} = attrs
  const pageSlug = getPageSlug(pageId, title)
  return (
    <NodeViewWrapper>
      <Link
        to={`/pages/${pageSlug}`}
        className='flex w-full items-center rounded-sm p-1 no-underline! transition-colors hover:bg-slate-200'
      >
        <DescriptionIcon />
        <div className='pl-1'>{title}</div>
      </Link>
    </NodeViewWrapper>
  )
}
