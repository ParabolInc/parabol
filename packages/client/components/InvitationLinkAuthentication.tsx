import {useState} from 'react'
import GenericAuthentication, {AuthPageSlug, GotoAuthPage} from './GenericAuthentication'

interface Props {
  teamName: string
  invitationToken: string
}

const InvitationLinkAuthentication = (props: Props) => {
  const [page, setPage] = useState<AuthPageSlug>('create-account')
  const goToPage: GotoAuthPage = (page) => {
    setPage(page)
  }
  return <GenericAuthentication {...props} goToPage={goToPage} page={page} />
}

export default InvitationLinkAuthentication
