import {Lock} from '@mui/icons-material'
import React from 'react'
import {useHistory} from 'react-router'
import {Button} from '../../../../ui/Button/Button'
import plural from '../../../../utils/plural'

type Props = {
  hiddenTeamCount: number
  orgId: string
}

const TeaserOrgTeamsRow = (props: Props) => {
  const {hiddenTeamCount, orgId} = props
  const history = useHistory()

  const handleSeePlansClick = () => {
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
              Parabol Enterprise includes our Org Admin role, which allows you to{' '}
              <strong>see all teams</strong> in your organization.
            </div>
          </div>
        </div>
        <div className='flex items-center justify-center'>
          <div className='flex h-12 w-8 flex-row items-center py-2'>
            <Lock className='h-8 w-8 text-slate-600' />
          </div>
        </div>
      </div>
      <div className='px-4 pb-4'>
        <Button
          variant='primary'
          shape='pill'
          className='bg-pink-500 hover:bg-pink-600 px-6 py-2 text-base text-white'
          onClick={handleSeePlansClick}
        >
          See Plans
        </Button>
      </div>
    </div>
  )
}

export default TeaserOrgTeamsRow
