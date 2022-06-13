import React, {Suspense} from 'react'
import orgMembersQuery, {OrgMembersQuery} from '~/__generated__/OrgMembersQuery.graphql'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'
import {LoaderSize} from '../../../../types/constEnums'
import {renderLoader} from '../../../../utils/relay/renderLoader'
import OrgMembers from '../../components/OrgMembers/OrgMembers'

interface Props {
  orgId: string
}

const OrgMembersRoot = (props: Props) => {
  const {orgId} = props
  const queryRef = useQueryLoaderNow<OrgMembersQuery>(orgMembersQuery, {
    orgId,
    first: 10000
  })
  return (
    <Suspense fallback={renderLoader({size: LoaderSize.PANEL})}>
      {queryRef && <OrgMembers queryRef={queryRef} />}
    </Suspense>
  )
}

export default OrgMembersRoot
