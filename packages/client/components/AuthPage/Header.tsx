/**
 * The brand header for the authentication homepages.
 *
 */
import {Link} from 'react-router'
import parabolLogo from '../../styles/theme/images/brand/lockup_color_mark_white_type.svg'

export default () => (
  <div className='flex h-14 min-h-14 w-full flex-row items-center justify-center bg-grape-700 text-white'>
    <Link className='block p-2' to='/' title='Parabol Home'>
      <img className='block' crossOrigin='' src={parabolLogo} alt='' />
    </Link>
  </div>
)
