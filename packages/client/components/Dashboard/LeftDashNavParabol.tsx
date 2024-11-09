import styled from '@emotion/styled'
import PlainButton from '~/components/PlainButton/PlainButton'
import {PALETTE} from '~/styles/paletteV3'
import {NavSidebar} from '~/types/constEnums'
import parabolLogo from '../../styles/theme/images/brand/lockup_color_mark_dark_type.svg'

const Parabol = styled(PlainButton)({
  alignItems: 'center',
  color: PALETTE.SLATE_700,
  display: 'flex',
  fontSize: NavSidebar.FONT_SIZE,
  fontWeight: 600,
  lineHeight: NavSidebar.LINE_HEIGHT,
  padding: 8,
  userSelect: 'none',
  width: '100%'
})

const LeftDashParabol = () => {
  return (
    <Parabol>
      <img crossOrigin='' src={parabolLogo} alt='Parabol logo' />
    </Parabol>
  )
}

export default LeftDashParabol
