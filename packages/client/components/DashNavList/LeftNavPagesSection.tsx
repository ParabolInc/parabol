import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {LeftNavPagesSection_page$key} from '../../__generated__/LeftNavPagesSection_page.graphql'
import {LeftNavPageLink} from './LeftNavPageLink'
interface Props {
  title: string
  pageRef: LeftNavPagesSection_page$key
}
export const LeftNavPagesSection = (props: Props) => {
  const {title, pageRef} = props
  const pageArray = useFragment(
    graphql`
      fragment LeftNavPagesSection_page on Page @relay(plural: true) {
        ...LeftNavPageLink_page
        id
        title
      }
    `,
    pageRef
  )
  return (
    <div>
      <div className='flex-1 py-1.5 pl-3 text-xs leading-5 font-semibold text-slate-700'>
        {title}
      </div>
      {pageArray.map((page) => {
        const {id} = page
        return <LeftNavPageLink key={id} pageRef={page} />
      })}
    </div>
  )
}
