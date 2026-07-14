import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from 'parabol-client'

export const Grouped = () => (
  <div className='w-72 pb-64'>
    <Select defaultOpen>
      <SelectTrigger>
        <SelectValue placeholder='Choose a template' />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <div className='px-3 pt-2 pb-1 font-semibold text-slate-500 text-xs uppercase'>
            Recurring
          </div>
          <SelectItem value='retro'>Sprint Retrospective</SelectItem>
          <SelectItem value='standup'>Daily Standup</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <div className='px-3 pt-2 pb-1 font-semibold text-slate-500 text-xs uppercase'>
            One-off
          </div>
          <SelectItem value='planning'>Q3 Planning</SelectItem>
          <SelectItem value='health'>Team Health Check</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>
)
