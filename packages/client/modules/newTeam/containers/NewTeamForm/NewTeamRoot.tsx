import React, {Suspense} from 'react'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'
import useRouter from '../../../../hooks/useRouter'
import newTeamQuery, {NewTeamQuery} from '../../../../__generated__/NewTeamQuery.graphql'
import NewTeam from '../../NewTeam'

const NewTeamRoot = () => {
  const {match} = useRouter<{defaultOrgId: string}>()
  const {params} = match
  const {defaultOrgId} = params
  const queryRef = useQueryLoaderNow<NewTeamQuery>(newTeamQuery)
  return (
    <Suspense fallback={''}>
      {queryRef && <NewTeam queryRef={queryRef} defaultOrgId={defaultOrgId} />}
    </Suspense>
  )
}

export default NewTeamRoot
