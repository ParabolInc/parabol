import React, {useState} from 'react'
import GenericAuthentication, {AuthPageSlug, GotoAuathPage} from './GenericAuthentication'

interface Props {
  teamName: string
  invitationToken: string
}

const InvitationLinkAuthentication = (props: Props) => {
  const [page, setPage] = useState<AuthPageSlug>('create-account')
  const gotoPage: GotoAuathPage = (page) => {
    setPage(page)
  }
  return <GenericAuthentication {...props} gotoPage={gotoPage} page={page} />
}

export default InvitationLinkAuthentication
