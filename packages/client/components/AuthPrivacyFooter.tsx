const AuthPrivacyFooter = () => (
  <div className='mt-2 text-center text-[11px] text-fg-secondary leading-6'>
    {'By creating an account, you agree to our '}
    <a
      className='mt-4 text-center text-accent hover:text-accent hover:underline focus:text-accent focus:underline active:text-accent active:underline'
      href='https://www.parabol.co/privacy'
      rel='noopener noreferrer'
      target='_blank'
      title='Privacy Policy'
    >
      {'Privacy Policy'}
    </a>
    .
  </div>
)

export default AuthPrivacyFooter
