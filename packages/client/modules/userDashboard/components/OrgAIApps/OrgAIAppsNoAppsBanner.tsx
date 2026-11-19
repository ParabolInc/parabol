import {Warning} from '../../../../ui/icons'

interface Props {
  orgName: string
}

const OrgAIAppsNoAppsBanner = ({orgName}: Props) => (
  <div className='flex items-center gap-3 border-hairline border-t bg-gold-100 px-4 py-2.5 text-gold-900 dark:bg-gold-900 dark:text-gold-100'>
    <Warning className='shrink-0 text-[20px] text-gold-700 dark:text-gold-300' />
    <span className='font-medium text-sm'>
      <b className='font-semibold'>{orgName} allows no apps.</b> These connections can’t reach it
      until you allow apps again.
    </span>
  </div>
)

export default OrgAIAppsNoAppsBanner
