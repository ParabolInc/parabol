import {Link} from '@tanstack/react-router'
import {Info} from '../../../../ui/icons'

interface Props {
  orgId: string
  isFollowing: boolean
}

const OrgAIAppsPolicyHelp = ({orgId, isFollowing}: Props) => (
  <div className='flex items-start gap-2 border-hairline border-t px-4 py-3 text-fg-secondary text-sm'>
    <Info className='mt-0.5 shrink-0 text-base' />
    <p className='m-0'>
      {isFollowing ? (
        <>
          Until you choose, this follows{' '}
          <Link
            to='/me/organizations/$orgId/settings'
            params={{orgId}}
            className='font-semibold text-accent hover:underline'
          >
            Enable AI Features
          </Link>{' '}
          in Organization Settings.
        </>
      ) : (
        'Changes apply right away, including to existing connections.'
      )}{' '}
      Doesn’t affect apps registered in Authentication or personal access tokens.
    </p>
  </div>
)

export default OrgAIAppsPolicyHelp
