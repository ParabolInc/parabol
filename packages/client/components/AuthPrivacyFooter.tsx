import styled from '@emotion/styled'

const color = 'var(--color-accent)'

const Link = styled('a')({
  color,
  marginTop: '1rem',
  textAlign: 'center',
  ':hover,:focus,:active': {
    color,
    textDecoration: 'underline'
  }
})

const FooterCopy = styled('div')({
  color: 'var(--color-fg-secondary)',
  fontSize: 11,
  lineHeight: '24px',
  marginTop: 8,
  textAlign: 'center'
})

const AuthPrivacyFooter = () => (
  <FooterCopy>
    {'By creating an account, you agree to our '}
    <Link
      href='https://www.parabol.co/privacy'
      rel='noopener noreferrer'
      target='_blank'
      title='Privacy Policy'
    >
      {'Privacy Policy'}
    </Link>
    .
  </FooterCopy>
)

export default AuthPrivacyFooter
