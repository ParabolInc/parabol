import {ExpandMore, Search} from '~/ui/icons'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import PlainButton from './PlainButton/PlainButton'
import ScopingSearchHistoryMenu, {type SearchQueries} from './ScopingSearchHistoryMenu'

interface Props {
  searchQueries?: SearchQueries[]
}

const ScopingSearchHistoryToggle = (props: Props) => {
  const {searchQueries} = props
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_LEFT, {
    loadingWidth: 200,
    noClose: true
  })

  if (!searchQueries) {
    return <Search className='m-[3px] mr-[15px] text-fg-secondary' />
  }

  return (
    <>
      <PlainButton
        className='flex items-center justify-center pr-2'
        onClick={togglePortal}
        ref={originRef}
      >
        <Search className='text-fg-secondary' />
        <ExpandMore className='-ml-2 h-[18px] w-[18px] text-fg-primary' />
      </PlainButton>

      {menuPortal(<ScopingSearchHistoryMenu searchQueries={searchQueries} menuProps={menuProps} />)}
    </>
  )
}

export default ScopingSearchHistoryToggle
