import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {ExpandMore as ExpandMoreIcon, Share as ShareIcon} from '~/ui/icons'
import type {TemplateSharing_template$key} from '../../../__generated__/TemplateSharing_template.graphql'
import {MenuPosition} from '../../../hooks/useCoords'
import useMenu from '../../../hooks/useMenu'
import {cn} from '../../../ui/cn'
import lazyPreload from '../../../utils/lazyPreload'

const SelectSharingScopeDropdown = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'SelectSharingScopeDropdown' */
      '../../../components/SelectSharingScopeDropdown'
    )
)

interface Props {
  isOwner: boolean
  template: TemplateSharing_template$key
  readOnly?: boolean
}

const TemplateSharing = (props: Props) => {
  const {isOwner} = props

  if (!isOwner) return null

  return (
    <>
      <hr className='m-0 ml-14 h-px shrink-0 border-none bg-hairline-strong p-0' />
      <div className='ly-2 ml-4 py-2 pr-auto pl-0'>
        <UnstyledTemplateSharing {...props} />
      </div>
    </>
  )
}

export const UnstyledTemplateSharing = (props: Props) => {
  const {template: templateRef, isOwner, readOnly} = props
  const template = useFragment(
    graphql`
      fragment TemplateSharing_template on MeetingTemplate {
        ...SelectSharingScopeDropdown_template
        id
        scope
        team {
          name
          organization {
            name
          }
        }
      }
    `,
    templateRef
  )
  const {scope, team} = template
  const {name: teamName, organization} = team
  const {name: orgName} = organization
  const {togglePortal, menuPortal, originRef, menuProps} = useMenu<HTMLDivElement>(
    MenuPosition.UPPER_LEFT,
    {
      isDropdown: true,
      id: 'sharingScopeDropdown',
      menuContentStyles: {
        minWidth: 320
      }
    }
  )
  if (!isOwner) return null
  const label =
    scope === 'TEAM'
      ? `Only visible to ${teamName}`
      : scope === 'ORGANIZATION'
        ? `Sharing with ${orgName}`
        : 'Sharing publicly'
  return (
    <>
      <div
        className={cn(
          'flex select-none items-center text-base text-fg-primary',
          !readOnly && 'cursor-pointer'
        )}
        onMouseEnter={SelectSharingScopeDropdown.preload}
        onClick={togglePortal}
        ref={originRef}
      >
        <div className='mr-4 flex h-6 w-6 cursor-pointer items-center justify-center text-fg-secondary [&_svg]:text-[18px]'>
          <ShareIcon />
        </div>
        <div>{label}</div>

        <div className='m-2 h-6 w-6'>{!readOnly && <ExpandMoreIcon />}</div>
      </div>
      {menuPortal(<SelectSharingScopeDropdown menuProps={menuProps} template={template} />)}
    </>
  )
}

export default TemplateSharing
