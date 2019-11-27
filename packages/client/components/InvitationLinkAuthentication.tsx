import React, {useState} from 'react'
import GenericAuthentication, {AuthPageSlug, GotoAuthPage} from './GenericAuthentication'

interface Props {
  teamName: string
  invitationToken: string
}

const InvitationLinkAuthentication = (props: Props) => {
  const [page, setPage] = useState<AuthPageSlug>('create-account')
  const gotoPage: GotoAuthPage = (page) => {
    setPage(page)
  }
  return <GenericAuthentication {...props} gotoPage={gotoPage} page={page} />
}

export default InvitationLinkAuthentication
