import SearchIcon from '@mui/icons-material/Search'
import {VisuallyHidden} from '@radix-ui/react-visually-hidden'
import LeftDashNavItem from '../../components/Dashboard/LeftDashNavItem'
import useHotkey from '../../hooks/useHotkey'
import {Dialog} from '../../ui/Dialog/Dialog'
import {DialogContent} from '../../ui/Dialog/DialogContent'
import {DialogDescription} from '../../ui/Dialog/DialogDescription'
import {DialogTitle} from '../../ui/Dialog/DialogTitle'
import {useSearchDialog} from './SearchContext'
import {SearchDialogContent} from './SearchDialogContent'

interface Props {}

export const SearchDialog = (_props: Props) => {
  const {openSearch} = useSearchDialog()
  return (
    <LeftDashNavItem
      Icon={SearchIcon}
      href={''}
      label={'Search'}
      exact
      onClick={() => openSearch()}
    />
  )
}

export const GlobalSearchDialog = () => {
  const {isOpen, closeSearch, openSearch, initialQuery} = useSearchDialog()

  const onOpenChange = (willOpen: boolean) => {
    if (willOpen) {
      openSearch(initialQuery)
    } else {
      closeSearch()
    }
  }

  useHotkey('mod+k', () => openSearch())

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          'top-[15%] w-full translate-y-0 animate-in overflow-hidden bg-white p-0 duration-200 focus:outline-none'
        }
      >
        <VisuallyHidden asChild>
          <DialogTitle>Search</DialogTitle>
        </VisuallyHidden>
        <VisuallyHidden asChild>
          <DialogDescription>Search for pages and content in Parabol</DialogDescription>
        </VisuallyHidden>
        <SearchDialogContent closeSearch={closeSearch} initialQuery={initialQuery} />
      </DialogContent>
    </Dialog>
  )
}
