import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {PALETTE} from '~/styles/paletteV3'
import {DashNavList_organization$key} from '../../__generated__/DashNavList_organization.graphql'
import {TierEnum} from '../../__generated__/DowngradeToStarterMutation.graphql'
import useBreakpoint from '../../hooks/useBreakpoint'
import {Breakpoint} from '../../types/constEnums'
import {upperFirst} from '../../utils/upperFirst'
import LeftDashNavItem from '../Dashboard/LeftDashNavItem'
import BaseTag from '../Tag/BaseTag'
import DashNavListTeams from './DashNavListTeams'
import DashNavMenu from './DashNavMenu'

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
  organizationsRef: DashNavList_organization$key | null
  onClick?: () => void
}

const DashNavList = (props: Props) => {
  const {onClick, organizationsRef} = props
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
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const teams = organizations?.flatMap((org) => org.viewerTeams)

  if (teams?.length === 0) {
    return <EmptyTeams>It appears you are not a member of any team!</EmptyTeams>
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

            {isDesktop ? (
              <DashNavMenu />
            ) : (
              <StyledLeftDashNavItem
                className={'bg-transparent'}
                icon={'manageAccounts'}
                isViewerOnTeam
                onClick={onClick}
                href={`/me/organizations/${org.id}/billing`}
                label={'Settings & Members'}
              />
            )}

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
