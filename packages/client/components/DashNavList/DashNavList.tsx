import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {useFragment} from 'react-relay'
import {PALETTE} from '~/styles/paletteV3'
import {DashNavList_organization$key} from '../../__generated__/DashNavList_organization.graphql'
import {TierEnum} from '../../__generated__/DowngradeToStarterMutation.graphql'
import {Menu} from '../../ui/Menu/Menu'
import {MenuItem} from '../../ui/Menu/MenuItem'
import {upperFirst} from '../../utils/upperFirst'
import LeftDashNavItem from '../Dashboard/LeftDashNavItem'
import BaseTag from '../Tag/BaseTag'
import DashNavListTeams from './DashNavListTeams'

const EmptyTeams = styled('div')({
  fontSize: 16,
  fontStyle: 'italic',
  padding: 16,
  textAlign: 'center'
})

const StyledLeftDashNavItem = styled(LeftDashNavItem)<{isViewerOnTeam: boolean}>(
  ({isViewerOnTeam}) => ({
    color: isViewerOnTeam ? PALETTE.SLATE_700 : PALETTE.SLATE_600,
    borderRadius: 44,
    paddingLeft: 15
  })
)

const Tag = styled(BaseTag)<{tier: TierEnum | null}>(({tier}) => ({
  backgroundColor:
    tier === 'enterprise' ? PALETTE.SKY_500 : tier === 'team' ? PALETTE.GOLD_300 : PALETTE.JADE_400,
  color: tier === 'team' ? PALETTE.GRAPE_700 : PALETTE.WHITE
}))

interface Props {
  className?: string
  organizationsRef: DashNavList_organization$key | null
  onClick?: () => void
}

const DashNavList = (props: Props) => {
  const {className, onClick, organizationsRef} = props
  const [showMenu, setShowMenu] = useState(false)
  const organizations = useFragment(
    graphql`
      fragment DashNavList_organization on Organization @relay(plural: true) {
        id
        name
        tier
        ...DashNavListTeams_organization
        viewerTeams {
          id
        }
      }
    `,
    organizationsRef
  )
  const teams = organizations?.flatMap((org) => org.viewerTeams)

  if (teams?.length === 0) {
    return <EmptyTeams>It appears you are not a member of any team!</EmptyTeams>
  }

  const handleClick = () => {
    console.log('cklickkkckckck')
    setShowMenu(true)
  }

  return (
    <div className='w-full pr-2 lg:p-2'>
      {organizations?.map((org) => {
        return (
          <div
            key={org.id}
            className='mb-3 h-full w-full rounded-lg border-2 border-solid border-slate-300 px-2 pt-2'
          >
            <div className='flex flex-wrap items-center'>
              <div className='flex min-w-0 flex-1 flex-wrap items-center justify-between'>
                <span className='text-md pl-2 font-medium leading-6 text-slate-700 '>
                  {org.name}
                </span>
                <div className='flex w-auto justify-end px-0 text-right'>
                  <Tag tier={org.tier}>{upperFirst(org.tier)}</Tag>
                </div>
              </div>
            </div>

            <Menu
              side='right'
              sideOffset={20}
              trigger={
                <div>
                  <StyledLeftDashNavItem
                    className={className}
                    onClick={handleClick}
                    icon={'manageAccounts'}
                    isViewerOnTeam
                    // href={`/me/organizations/${org.id}/billing`}
                    label={'Settings & Members'}
                  />
                </div>
              }
            >
              <MenuItem className='h-80 w-full' onClick={() => {}}>
                Change template
              </MenuItem>
            </Menu>
            <div className='border-t border-solid border-slate-300' />
            <DashNavListTeams onClick={onClick} organizationRef={org} />
          </div>
        )
      })}
    </div>
  )
}

graphql`
  fragment DashNavListTeam on Team {
    id
    isPaid
    name
    isViewerOnTeam
    tier
    organization {
      id
      name
      lockedAt
    }
  }
`

export default DashNavList
