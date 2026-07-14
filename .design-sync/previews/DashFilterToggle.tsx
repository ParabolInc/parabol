import {DashFilterToggle} from 'parabol-client'

export const ByOwner = () => (
  <div className='p-2'>
    <DashFilterToggle
      label='Owner'
      value='All Teammates'
      iconText='person'
      onClick={() => {}}
      onMouseEnter={() => {}}
    />
  </div>
)

export const ByTeam = () => (
  <div className='p-2'>
    <DashFilterToggle
      label='Team'
      value='Engineering'
      iconText='group'
      onClick={() => {}}
      onMouseEnter={() => {}}
    />
  </div>
)

export const Unfiltered = () => (
  <div className='p-2'>
    <DashFilterToggle
      label='Meetings'
      value='All Meetings'
      onClick={() => {}}
      onMouseEnter={() => {}}
    />
  </div>
)
