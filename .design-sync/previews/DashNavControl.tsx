import {DashNavControl} from 'parabol-client'

export const Back = () => (
  <div className='p-2'>
    <DashNavControl icon='arrow_back' label='Back to Meetings' onClick={() => {}} />
  </div>
)

export const AddTeam = () => (
  <div className='p-2'>
    <DashNavControl icon='add' label='Add a Team' onClick={() => {}} />
  </div>
)
