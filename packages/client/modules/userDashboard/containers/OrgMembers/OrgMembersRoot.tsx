import React, {Suspense} from 'react'
import graphql from 'babel-plugin-relay/macro'
import {usePreloadedQuery, PreloadedQuery} from 'react-relay'
import OrgMembers from '../../components/OrgMembers/OrgMembers'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'
import orgMembersRootQuery, {
  OrgMembersRootQuery
} from '../../../../__generated__/OrgMembersRootQuery.graphql'

const query = graphql`
  query OrgMembersRootQuery($orgId: ID!, $first: Int!, $after: String) {
    viewer {
      ...OrgMembers_viewer
    }
  }
`

interface Props {
  orgId: string
}

const OrgMembersRoot = (props: Props) => {
  const {orgId} = props
  const queryRef = useQueryLoaderNow<OrgMembersRootQuery>(orgMembersRootQuery, {
    orgId,
    first: 10000
  })
  return <Suspense fallback={''}>{queryRef && <OrgMembersWrapper queryRef={queryRef} />}</Suspense>
}

interface OrgMembersWrapperProps {
  queryRef: PreloadedQuery<OrgMembersRootQuery>
}

function OrgMembersWrapper(props: OrgMembersWrapperProps) {
  const {queryRef} = props
  const data = usePreloadedQuery<OrgMembersRootQuery>(query, queryRef, {
    UNSTABLE_renderPolicy: 'full'
  })
  const {viewer} = data
  return <OrgMembers viewer={viewer} />
}

export default OrgMembersRoot
