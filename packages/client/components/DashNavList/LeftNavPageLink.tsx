import AddIcon from '@mui/icons-material/Add'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import DescriptionIcon from '@mui/icons-material/Description'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {useRouteMatch} from 'react-router'
import {Link} from 'react-router-dom'
import type {LeftNavPageLink_page$key} from '../../__generated__/LeftNavPageLink_page.graphql'
import {toSlug} from '../../shared/toSlug'
interface Props {
  pageRef: LeftNavPageLink_page$key
}
export const LeftNavPageLink = (props: Props) => {
  const {pageRef} = props
  const page = useFragment(
    graphql`
      fragment LeftNavPageLink_page on Page {
        id
        title
      }
    `,
    pageRef
  )
  const {title, id} = page
  const pageIdNum = id.split(':')[1]
  const titleSlug = toSlug(title || '')
  const slug = titleSlug ? `${titleSlug}-${pageIdNum}` : pageIdNum
  const match = useRouteMatch(`/pages/:slug(.*)-${pageIdNum}`)
  const isActive = match?.isExact ?? false
  return (
    <Link to={`/pages/${slug}`} key={slug} className='mx-1 flex'>
      <div
        data-highlighted={isActive ? '' : undefined}
        className={
          'group flex w-full cursor-pointer items-center space-x-2 rounded-md px-3 py-1 text-sm leading-8 text-slate-700 outline-hidden hover:bg-slate-300! hover:text-slate-900 focus:bg-slate-200 data-highlighted:bg-slate-300 data-highlighted:text-slate-900'
        }
      >
        <div className='flex size-6 items-center justify-center rounded-sm bg-slate-200 group-hover:bg-slate-300 group-data-highlighted:bg-slate-300 hover:bg-slate-400'>
          <DescriptionIcon className='size-5 group-hover:hidden' />
          <ChevronRightIcon className='hidden size-5 group-hover:block' />
        </div>
        <div className='flex flex-col text-sm font-medium'>
          <span>{title}</span>
        </div>
        <div className='flex flex-1 items-center justify-end'>
          <div className='flex size-6 items-center justify-center rounded-sm hover:bg-slate-400'>
            <AddIcon className='hidden size-5 group-hover:block' />
          </div>
        </div>
      </div>
    </Link>
  )
}
