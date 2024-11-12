import {Lock} from '@mui/icons-material'
import {useHistory} from 'react-router'
import plural from '../../../../utils/plural'

type Props = {
  hiddenTeamCount: number
  orgId: string
}

const TeaserOrgTeamsRow = (props: Props) => {
  const {hiddenTeamCount, orgId} = props
  const history = useHistory()

  const handleParabolEnterpriseClick = () => {
    history.push(`/me/organizations/${orgId}/billing`)
  }

  return (
    <div className='block cursor-default select-none'>
      <div className='flex items-center p-4'>
        <div className='flex flex-1 flex-col py-1'>
          <div className='flex items-center text-lg font-bold'>
            {hiddenTeamCount} {plural(hiddenTeamCount, 'Hidden Team')}
          </div>
          <div className='flex items-center justify-between'>
            <div className='text-gray-600'>
              <a
                href='#'
                onClick={handleParabolEnterpriseClick}
                className='font-bold text-sky-500 hover:text-sky-600'
              >
                Parabol Enterprise
              </a>{' '}
              includes our Org Admin role, which allows you to <strong>see all teams</strong> in
              your organization.
            </div>
          </div>
        </div>
        <div className='flex items-center justify-center'>
          <div className='flex h-8 w-6 flex-row items-center py-2'>
            <Lock className='h-6 w-6 text-slate-600' />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeaserOrgTeamsRow
