import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {ActivityDetailsBadges_template$key} from '~/__generated__/ActivityDetailsBadges_template.graphql'
import ActivityDetailsBadge from './ActivityDetailsBadge'
import ActivityDetailsCategoryBadge from './ActivityDetailsCategoryBadge'

interface Props {
  isEditing: boolean
  templateRef: ActivityDetailsBadges_template$key
}

const ActivityDetailsBadges = (props: Props) => {
  const {templateRef, isEditing} = props
  const template = useFragment(
    graphql`
      fragment ActivityDetailsBadges_template on MeetingTemplate {
        ...ActivityDetailsCategoryBadge_template
        isFree
        orgId
      }
    `,
    templateRef
  )
  const {isFree, orgId} = template
  const isParabolTemplate = orgId === 'aGhostOrg'
  const isPremium = isParabolTemplate && !isFree
  const isCustom = !isParabolTemplate
  return (
    <div className='mb-4 flex gap-2'>
      <ActivityDetailsCategoryBadge isEditing={isEditing} templateRef={template} />
      {isPremium && (
        <ActivityDetailsBadge className='bg-gold-300 text-grape-700 select-none'>
          Premium
        </ActivityDetailsBadge>
      )}
      {isCustom && (
        <ActivityDetailsBadge className='bg-grape-700 text-white select-none'>
          Custom
        </ActivityDetailsBadge>
      )}
    </div>
  )
}

export default ActivityDetailsBadges
