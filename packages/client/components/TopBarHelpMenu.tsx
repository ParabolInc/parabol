import {Bookmark, Comment, Keyboard} from '@mui/icons-material'
import useBreakpoint from '~/hooks/useBreakpoint'
import {Breakpoint, ExternalLinks} from '~/types/constEnums'
import useSWVersion from '../hooks/useSWVersion'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuItem} from '../ui/Menu/MenuItem'

const itemClassName = 'gap-2 py-2 leading-6'
const iconClassName = 'size-[18px] text-[18px] text-fg-secondary'

interface Props {
  toggleShortcuts(): void
}

const TopBarHelpMenu = (props: Props) => {
  const {toggleShortcuts} = props
  const swVersion = useSWVersion()
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const gotoSupport = () => {
    window.open(ExternalLinks.SUPPORT, '_blank', 'noreferrer')
  }
  const gotoContact = () => {
    window.open(ExternalLinks.CONTACT, '_blank', 'noreferrer')
  }
  const gotoVersion = () => {
    window.open(
      `https://github.com/ParabolInc/parabol/releases/tag/v${__APP_VERSION__}`,
      '_blank',
      'noreferrer'
    )
  }
  return (
    <MenuContent align='end' sideOffset={4} aria-label='How may we help?'>
      <MenuItem className={itemClassName} onSelect={gotoSupport}>
        <Bookmark className={iconClassName} />
        {'Documentation'}
      </MenuItem>
      {isDesktop && (
        <MenuItem className={itemClassName} onSelect={toggleShortcuts}>
          <Keyboard className={iconClassName} />
          {'Keyboard Shortcuts'}
        </MenuItem>
      )}
      <MenuItem className={itemClassName} onSelect={gotoContact}>
        <Comment className={iconClassName} />
        {'Get help'}
      </MenuItem>
      <MenuItem className='py-1 text-fg-muted text-xs' onSelect={gotoVersion}>
        Version {__APP_VERSION__}
        {swVersion !== __APP_VERSION__ && ` (sw${swVersion ?? ' unknown'})`}
      </MenuItem>
    </MenuContent>
  )
}

export default TopBarHelpMenu
