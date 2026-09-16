import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router'
import type {OrganizationRow_organization$key} from '~/__generated__/OrganizationRow_organization.graphql'
import {Button} from '~/ui/Button/Button'
import {Settings as SettingsIcon} from '~/ui/icons'
import Avatar from '../../../../components/Avatar/Avatar'
import Row from '../../../../components/Row/Row'
import RowActions from '../../../../components/Row/RowActions'
import RowInfo from '../../../../components/Row/RowInfo'
import RowInfoCopy from '../../../../components/Row/RowInfoCopy'
import RowInfoHeader from '../../../../components/Row/RowInfoHeader'
import RowInfoHeading from '../../../../components/Row/RowInfoHeading'
import TagBlock from '../../../../components/Tag/TagBlock'
import TierTag from '../../../../components/Tag/TierTag'
import defaultOrgAvatar from '../../../../styles/theme/images/avatar-organization.svg'
import {Tooltip} from '../../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../../ui/Tooltip/TooltipTrigger'
import plural from '../../../../utils/plural'

interface Props {
  organization: OrganizationRow_organization$key
}

const OrganizationRow = (props: Props) => {
  const {organization: organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment OrganizationRow_organization on Organization {
        id
        name
        orgUserCount {
          activeUserCount
          inactiveUserCount
        }
        picture
        tier
        billingTier
      }
    `,
    organizationRef
  )
  const navigate = useNavigate()
  const {
    id: orgId,
    name,
    orgUserCount: {activeUserCount, inactiveUserCount},
    picture,
    tier,
    billingTier
  } = organization
  const orgAvatar = picture || defaultOrgAvatar
  const onRowClick = () => {
    navigate(`/me/organizations/${orgId}`)
  }
  const totalUsers = activeUserCount + inactiveUserCount
  const showUpgradeCTA = billingTier === 'starter'
  return (
    <Row>
      <div
        className='sidebar-left:mr-4 sidebar-left:block hidden w-11 cursor-pointer'
        onClick={onRowClick}
      >
        <Avatar className='h-11 w-11' picture={orgAvatar} />
      </div>
      <div className='flex flex-1 flex-wrap items-center'>
        <RowInfo className='pl-0'>
          <RowInfoHeader>
            <RowInfoHeading className='cursor-pointer' onClick={onRowClick}>
              {name}
            </RowInfoHeading>
            {tier !== 'starter' && (
              <TagBlock className='block'>
                <TierTag tier={tier} billingTier={billingTier} />
              </TagBlock>
            )}
          </RowInfoHeader>
          <RowInfoCopy className='flex items-center'>
            {`${totalUsers} ${plural(totalUsers, 'User')}`}
            {billingTier !== 'enterprise' && ` (${activeUserCount} Active)`}
          </RowInfoCopy>
        </RowInfo>
        <RowActions>
          {showUpgradeCTA && (
            <Button
              variant='flat'
              size='sm'
              className='h-9 px-2 sidebar-left:px-4 text-sky-500 text-sm'
              onClick={onRowClick}
            >
              {'Upgrade'}
            </Button>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant='outline' size='sm' className='ml-2 h-9 w-9 p-0' onClick={onRowClick}>
                <div className='h-[18px] w-[18px] text-fg-secondary'>
                  <SettingsIcon className='text-[18px]' />
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent side='bottom'>Settings</TooltipContent>
          </Tooltip>
        </RowActions>
      </div>
    </Row>
  )
}

export default OrganizationRow
