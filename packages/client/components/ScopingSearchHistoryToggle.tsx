import {ExpandMore, Search} from '~/ui/icons'
import {Menu} from '../ui/Menu/Menu'
import {MenuContent} from '../ui/Menu/MenuContent'
import PlainButton from './PlainButton/PlainButton'
import ScopingSearchHistoryMenu, {type SearchQueries} from './ScopingSearchHistoryMenu'

interface Props {
  searchQueries?: SearchQueries[]
}

const ScopingSearchHistoryToggle = (props: Props) => {
  const {searchQueries} = props

  if (!searchQueries) {
    return <Search className='m-[3px] mr-[15px] text-fg-secondary' />
  }

  return (
    <Menu
      trigger={
        <PlainButton className='flex items-center justify-center pr-2'>
          <Search className='text-fg-secondary' />
          <ExpandMore className='-ml-2 h-[18px] w-[18px] text-fg-primary' />
        </PlainButton>
      }
    >
      <MenuContent align='start'>
        <ScopingSearchHistoryMenu searchQueries={searchQueries} />
      </MenuContent>
    </Menu>
  )
}

export default ScopingSearchHistoryToggle
