import {useNavigate} from 'react-router'
import customTemplate from '../../../../../static/images/illustrations/customTemplate.png'
import type {MeetingTypeEnum} from '../../../__generated__/TeamInvitationQuery.graphql'
import FloatingActionButton from '../../../components/FloatingActionButton'
import useAtmosphere from '../../../hooks/useAtmosphere'
import SendClientSideEvent from '../../../utils/SendClientSideEvent'

interface Props {
  orgId: string
  meetingType: MeetingTypeEnum
}

const CustomTempateUpgradeMsg = (props: Props) => {
  const {orgId, meetingType} = props
  const navigate = useNavigate()
  const atmosphere = useAtmosphere()

  const handleClick = () => {
    SendClientSideEvent(atmosphere, 'Upgrade CTA Clicked', {
      upgradeCTALocation: 'createNewTemplate',
      meetingType
    })
    navigate(`/me/organizations/${orgId}/billing`)
  }

  return (
    <div className='flex w-full max-w-[520px] flex-col overflow-hidden'>
      <img
        className='mx-auto max-h-[200px] w-full max-w-[360px] object-contain pt-4'
        src={customTemplate}
      />
      <div className='flex w-full flex-col py-4 text-center font-semibold text-[20px]'>
        {'Create Custom Templates'}
      </div>
      <div className='flex w-full px-12 py-4 text-center text-[16px] leading-6'>
        {'Upgrade to create custom templates that you can share with your organization or team'}
      </div>
      <div className='pointer-events-none z-[1] flex h-full w-full animate-[fade-in_200ms_cubic-bezier(0,0,.2,1)] items-center justify-center'>
        <FloatingActionButton
          className='pointer-events-auto border-0 px-6 py-[10px] text-[16px]'
          onClick={handleClick}
          palette='pink'
        >
          {'Upgrade Now'}
        </FloatingActionButton>
      </div>
    </div>
  )
}

export default CustomTempateUpgradeMsg
