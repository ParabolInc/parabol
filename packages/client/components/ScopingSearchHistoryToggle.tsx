import styled from '@emotion/styled'
import {ExpandMore, Search} from '@mui/icons-material'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import PlainButton from './PlainButton/PlainButton'
import ScopingSearchHistoryMenu, {type SearchQueries} from './ScopingSearchHistoryMenu'

const StyledIcon = styled(Search)({
  color: 'var(--color-fg-secondary)',
  margin: '3px 15px 3px 3px'
})

const DropdownIcon = styled(ExpandMore)({
  color: 'var(--color-fg-primary)',
  height: 18,
  width: 18,
  marginLeft: -8
})

const StyledIconDropdown = styled(Search)({
  color: 'var(--color-fg-secondary)'
})

const Toggle = styled(PlainButton)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  paddingRight: 8
})

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
    return <StyledIcon />
  }

  return (
    <>
      <Toggle onClick={togglePortal} ref={originRef}>
        <StyledIconDropdown />
        <DropdownIcon />
      </Toggle>

      {menuPortal(<ScopingSearchHistoryMenu searchQueries={searchQueries} menuProps={menuProps} />)}
    </>
  )
}

export default ScopingSearchHistoryToggle
