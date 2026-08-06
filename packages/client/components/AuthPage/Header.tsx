/**
 * The brand header for the authentication homepages.
 *
 */
import styled from '@emotion/styled'
import {Link} from 'react-router'
import parabolLogo from '../../styles/theme/images/brand/lockup_color_mark_white_type.svg'
import {AppBar} from '../../types/constEnums'

const HeaderContainer = styled('div')({
  alignItems: 'center',
  backgroundColor: 'var(--color-surface-topbar)',
  color: 'var(--color-fg-topbar)',
  display: 'flex',
  flexDirection: 'row',
  height: AppBar.HEIGHT,
  justifyContent: 'center',
  minHeight: AppBar.HEIGHT,
  width: '100%'
})

const HeaderBrand = styled(Link)({
  display: 'block',
  padding: 8
})

const Img = styled('img')({
  display: 'block'
})

export default () => (
  <HeaderContainer>
    <HeaderBrand to='/' title='Parabol Home'>
      <Img crossOrigin='' src={parabolLogo} alt='' />
    </HeaderBrand>
  </HeaderContainer>
)
