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
    <>
      <div className='flex cursor-not-allowed items-center bg-slate-100 p-4 pb-0 opacity-50'>
        <div className='flex flex-1 flex-col py-1 '>
          <div className='text-gray-700 flex items-center text-lg font-bold'>
            {hiddenTeamCount} {plural(hiddenTeamCount, 'Hidden Team')}
          </div>
        </div>
      </div>
      <div className='flex items-center justify-between bg-white px-4 pb-4'>
        <div className='flex items-center'>
          <Lock className='h-10 w-10 select-none rounded-full p-1.5 text-grape-500' />
          <p className='ml-3 text-sm text-slate-700'>
            Parabol Enterprise includes our Org Admin role, which allows you to see{' '}
            <strong>all</strong> teams in your organization
          </p>
        </div>
        <Button
          variant='destructive'
          shape='pill'
          className='w-32 py-2 text-base'
          onClick={handleSeePlansClick}
        >
          See plans
        </Button>
      </div>
    </>
  )
}

export default TeaserOrgTeamsRow
