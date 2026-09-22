import graphql from 'babel-plugin-relay/macro'
import {Suspense, useState} from 'react'
import {useFragment} from 'react-relay'
import {ExpandMore as ExpandMoreIcon, Share as ShareIcon} from '~/ui/icons'
import type {TemplateSharing_template$key} from '../../../__generated__/TemplateSharing_template.graphql'
import {cn} from '../../../ui/cn'
import {Menu} from '../../../ui/Menu/Menu'
import {Tooltip} from '../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../ui/Tooltip/TooltipTrigger'
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
        type
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
  const {scope, team, type} = template
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)
  const {name: teamName, organization} = team
  const {name: orgName} = organization
  if (!isOwner) return null
  const label =
    scope === 'TEAM'
      ? `Only visible to ${teamName}`
      : scope === 'ORGANIZATION'
        ? `Sharing with ${orgName}`
        : 'Sharing publicly'
  if (type === 'teamHealth') {
    return (
      <Tooltip open={isTooltipOpen} onOpenChange={setIsTooltipOpen}>
        <TooltipTrigger asChild>
          <div
            tabIndex={0}
            className='flex select-none items-center text-base text-fg-primary'
            // radix closes tooltips on click, which leaves touch users with no way to read it
            onClick={(e) => {
              e.preventDefault()
              setIsTooltipOpen(true)
            }}
          >
            <div className='mr-4 flex h-6 w-6 items-center justify-center text-fg-secondary [&_svg]:text-[18px]'>
              <ShareIcon />
            </div>
            <div className='my-2 mr-2 min-h-6'>{label}</div>
          </div>
        </TooltipTrigger>
        <TooltipContent
          collisionPadding={16}
          className='max-w-[calc(100vw-32px)] whitespace-normal'
        >
          Team health templates are always shared across the organization
        </TooltipContent>
      </Tooltip>
    )
  }
  return (
    <Menu
      trigger={
        <div
          className={cn(
            'flex select-none items-center text-base text-fg-primary',
            !readOnly && 'cursor-pointer'
          )}
          onMouseEnter={SelectSharingScopeDropdown.preload}
        >
          <div className='mr-4 flex h-6 w-6 cursor-pointer items-center justify-center text-fg-secondary [&_svg]:text-[18px]'>
            <ShareIcon />
          </div>
          <div>{label}</div>

          <div className='m-2 h-6 w-6'>{!readOnly && <ExpandMoreIcon />}</div>
        </div>
      }
    >
      <Suspense fallback={null}>
        <SelectSharingScopeDropdown template={template} />
      </Suspense>
    </Menu>
  )
}

export default TemplateSharing
