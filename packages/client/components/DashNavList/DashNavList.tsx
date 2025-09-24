import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {DashNavList_viewer$key} from '../../__generated__/DashNavList_viewer.graphql'
import {LeftNavPagesTrash} from './LeftNavPagesTrash'
import {LeftNavPrivatePagesSection} from './LeftNavPrivatePagesSection'
import {LeftNavSharedPagesSection} from './LeftNavSharedPagesSection'
import {LeftNavTeamsSection} from './LeftNavTeamsSection'

interface Props {
  viewerRef: DashNavList_viewer$key
  closeMobileSidebar?: () => void
}

const DashNavList = (props: Props) => {
  const {closeMobileSidebar, viewerRef} = props
  const viewer = useFragment(
    graphql`
      fragment DashNavList_viewer on User {
        ...LeftNavPrivatePagesSection_viewer
        ...LeftNavSharedPagesSection_viewer
        ...LeftNavTeamsSection_viewer
        teams {
          id
        }
      }
    `,
    viewerRef
  )
  return (
    <div className='w-full p-3 pt-4 pb-0'>
      <LeftNavTeamsSection closeMobileSidebar={closeMobileSidebar} viewerRef={viewer} />
      <div className='pt-2'>
        <LeftNavSharedPagesSection viewerRef={viewer} />
        <LeftNavPrivatePagesSection viewerRef={viewer} />
        <LeftNavPagesTrash />
      </div>
    </div>
  )
}

graphql`
  fragment DashNavListTeam on Team {
    id
    name
    isViewerOnTeam
    tier
    organization {
      id
      name
      isPaid
      lockedAt
    }
  }
`

export default DashNavList
