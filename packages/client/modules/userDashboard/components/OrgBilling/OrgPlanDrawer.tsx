import graphql from 'babel-plugin-relay/macro'
import {commitLocalUpdate, useFragment} from 'react-relay'
import {Close} from '~/ui/icons'
import type {OrgPlanDrawer_organization$key} from '../../../../__generated__/OrgPlanDrawer_organization.graphql'
import Confetti from '../../../../components/Confetti'
import LabelHeading from '../../../../components/LabelHeading/LabelHeading'
import PlainButton from '../../../../components/PlainButton/PlainButton'
import ResponsiveDashSidebar from '../../../../components/ResponsiveDashSidebar'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useBreakpoint from '../../../../hooks/useBreakpoint'
import {Breakpoint, DiscussionThreadEnum} from '../../../../types/constEnums'
import {cn} from '../../../../ui/cn'
import OrgPlanDrawerContent from './OrgPlanDrawerContent'

const isGlobalBannerEnabled = window.__ACTION__.GLOBAL_BANNER_ENABLED

type Props = {
  organizationRef: OrgPlanDrawer_organization$key
}

const OrgPlanDrawer = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment OrgPlanDrawer_organization on Organization {
        id
        showDrawer
        billingTier
        showConfetti
      }
    `,
    organizationRef
  )
  const {id: orgId, billingTier, showDrawer, showConfetti} = organization
  const atmosphere = useAtmosphere()
  const isDesktop = useBreakpoint(Breakpoint.ORG_DRAWER)

  const toggleSidebar = () => {
    commitLocalUpdate(atmosphere, (store) => {
      const org = store.get(orgId)
      if (!org) return
      const showDrawer = org.getValue('showDrawer')
      org.setValue(!showDrawer, 'showDrawer')
    })
  }

  return (
    <>
      <ResponsiveDashSidebar
        isOpen={showDrawer}
        isDesktop={isDesktop}
        onToggle={toggleSidebar}
        isRightDrawer
        sidebarWidth={DiscussionThreadEnum.WIDTH}
      >
        <div
          className={cn(
            'top-0 bottom-0 z-sidebar flex h-full w-[360px] flex-1 select-none flex-col justify-stretch overflow-hidden bg-surface-card transition-all duration-200 ease-[cubic-bezier(0,0,.2,1)]',
            isGlobalBannerEnabled ? 'pt-6' : 'pt-0',
            isDesktop
              ? 'fixed right-0 shadow-[0px_2px_4px_-1px_rgba(0,0,0,.2),0px_4px_5px_0px_rgba(0,0,0,.14),0px_1px_10px_0px_rgba(0,0,0,.12)] supports-[(height:1svh)_and_(height:1lvh)]:h-[100lvh]'
              : 'static supports-[(height:1svh)_and_(height:1lvh)]:h-[100svh]',
            showDrawer ? 'translate-x-0' : 'translate-x-[360px]'
          )}
        >
          <div className='flex w-full items-center justify-between py-4 pr-2 pl-4'>
            <LabelHeading className='text-xs normal-case leading-[18px]'>
              {'Plan Details'}
            </LabelHeading>
            <PlainButton className='flex h-[18px] items-center' onClick={toggleSidebar}>
              <Close className='cursor-pointer text-fg-secondary hover:opacity-50' />
            </PlainButton>
          </div>
          <OrgPlanDrawerContent tier={billingTier} />
        </div>
      </ResponsiveDashSidebar>
      <div className='-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 transform'>
        <Confetti active={showConfetti} />
      </div>
    </>
  )
}

export default OrgPlanDrawer
