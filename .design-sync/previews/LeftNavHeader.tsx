import ArticleIcon from '@mui/icons-material/Article'
import {LeftNavHeader} from 'parabol-client'

export const Pages = () => (
  <div className='w-64 rounded-md bg-slate-200 px-1'>
    <LeftNavHeader>
      <ArticleIcon className='text-slate-600' />
      <span className='pl-1 text-slate-700'>Pages</span>
    </LeftNavHeader>
  </div>
)
