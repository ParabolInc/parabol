import {useParams} from '@tanstack/react-router'
import {Suspense} from 'react'
import newTeamQuery, {type NewTeamQuery} from '../../../../__generated__/NewTeamQuery.graphql'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'
import NewTeam from '../../NewTeam'

const NewTeamRoot = () => {
  const {defaultOrgId} = useParams({strict: false})
  const queryRef = useQueryLoaderNow<NewTeamQuery>(newTeamQuery)
  return (
    <Suspense fallback={''}>
      {queryRef && <NewTeam queryRef={queryRef} defaultOrgId={defaultOrgId!} />}
    </Suspense>
  )
}

export default NewTeamRoot
