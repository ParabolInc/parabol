import AddIcon from '@mui/icons-material/Add'
import {LeftNavHeader, LeftNavHeaderButton} from 'parabol-client'

export const AddPage = () => (
  <div className='group flex w-56 items-center rounded-md bg-slate-300 px-1'>
    <LeftNavHeader>
      <span className='text-slate-700'>Pages</span>
    </LeftNavHeader>
    <LeftNavHeaderButton Icon={AddIcon} tooltip='Add a page' onClick={() => {}} />
  </div>
)
