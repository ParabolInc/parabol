import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {Link} from 'react-router-dom'
import type {LeftNavPagesSection_page$key} from '../../__generated__/LeftNavPagesSection_page.graphql'

interface Props {
  title: string
  pageRef: LeftNavPagesSection_page$key
}
export const LeftNavPagesSection = (props: Props) => {
  const {title, pageRef} = props
  const pageArray = useFragment(
    graphql`
      fragment LeftNavPagesSection_page on Page @relay(plural: true) {
        id
        title
      }
    `,
    pageRef
  )

  return (
    <div>
      <div className='flex-1 pl-3 text-base leading-6 font-semibold text-slate-700'>{title}</div>
      {pageArray.map((page) => {
        const {id, title} = page
        const slug = id.split(':')[1]
        return (
          <Link to={`/pages/${slug}`} key={slug}>
            <div>{title}</div>
          </Link>
        )
      })}
    </div>
  )
}
