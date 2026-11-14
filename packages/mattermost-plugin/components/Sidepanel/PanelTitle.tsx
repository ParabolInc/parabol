import {useSelector} from 'react-redux'

import {useCurrentChannel} from '../../hooks/useCurrentChannel'
import {getAssetsUrl} from '../../selectors'

const PanelTitle = () => {
  const channel = useCurrentChannel()
  const {name: channelName = null} = channel || {}
  const assetsPath = useSelector(getAssetsUrl)

  return (
    <div className='flex items-center'>
      <img width={24} height={24} src={`${assetsPath}/parabol.png`} />
      <div className='ml-[8px] font-bold text-[1.5rem] text-black no-underline'>
        Parabol{channelName && ` | ${channelName}`}
      </div>
    </div>
  )
}

export default PanelTitle
