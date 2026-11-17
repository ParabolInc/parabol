import {MailOutlined} from '~/ui/icons'
import useBreakpoint from '../../../../hooks/useBreakpoint'
import {Breakpoint} from '../../../../types/constEnums'
import ProviderRowActionButton from './ProviderRowActionButton'

interface Props {
  contactUsUrl: string
}

const ContactUsButton = (props: Props) => {
  const {contactUsUrl} = props
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)

  return (
    <form className='flex flex-1' method='get' target='_blank' action={contactUsUrl}>
      <ProviderRowActionButton key='request'>
        {isDesktop ? 'Contact Us' : <MailOutlined />}
      </ProviderRowActionButton>
    </form>
  )
}

export default ContactUsButton
