import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from 'parabol-client'

export const TemplatePicker = () => (
  <div className='w-72 pb-56'>
    <Select defaultOpen>
      <SelectTrigger>
        <SelectValue placeholder='Choose a template' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='retro'>Sprint Retrospective</SelectItem>
        <SelectItem value='standup'>Daily Standup</SelectItem>
        <SelectItem value='planning'>Q3 Planning</SelectItem>
        <SelectItem value='health'>Team Health Check</SelectItem>
      </SelectContent>
    </Select>
  </div>
)

export const Closed = () => (
  <div className='w-72'>
    <Select defaultValue='retro'>
      <SelectTrigger>
        <SelectValue placeholder='Choose a template' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='retro'>Sprint Retrospective</SelectItem>
        <SelectItem value='standup'>Daily Standup</SelectItem>
      </SelectContent>
    </Select>
  </div>
)
