import graphql from 'babel-plugin-relay/macro'
import React, {Suspense} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'
import {LoaderSize} from '../../../../types/constEnums'
import {renderLoader} from '../../../../utils/relay/renderLoader'
import orgMembersRootQuery, {
  OrgMembersRootQuery
} from '../../../../__generated__/OrgMembersRootQuery.graphql'
import OrgMembers from '../../components/OrgMembers/OrgMembers'

interface Props {
  orgId: string
}

const OrgMembersRoot = (props: Props) => {
  const {orgId} = props
  const queryRef = useQueryLoaderNow<OrgMembersRootQuery>(orgMembersRootQuery, {
    orgId,
    first: 10000
  })
  return (
    <Suspense fallback={renderLoader({size: LoaderSize.PANEL})}>
      {queryRef && <OrgMembersContainer queryRef={queryRef} />}
    </Suspense>
  )
}

interface OrgMembersContainerProps {
  queryRef: PreloadedQuery<OrgMembersRootQuery>
}

function OrgMembersContainer(props: OrgMembersContainerProps) {
  const {queryRef} = props
  const data = usePreloadedQuery<OrgMembersRootQuery>(
    graphql`
      query OrgMembersRootQuery($orgId: ID!, $first: Int!, $after: String) {
        ...OrgMembers_viewer
      }
    `,
    queryRef,
    {
      UNSTABLE_renderPolicy: 'full'
    }
  )
  return <OrgMembers viewerRef={data} />
}

export default OrgMembersRoot
