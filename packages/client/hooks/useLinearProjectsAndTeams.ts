import graphql from 'babel-plugin-relay/macro'
import {useMemo, useState} from 'react'
import {useFragment} from 'react-relay'
import {
  useLinearProjectsAndTeams_teamMember$data,
  useLinearProjectsAndTeams_teamMember$key
} from '../__generated__/useLinearProjectsAndTeams_teamMember.graphql'
import {getLinearRepoName} from '../utils/getLinearRepoName'
import getNonNullEdges from '../utils/getNonNullEdges'
import getUniqueEdges from '../utils/getUniqueEdges'
import {isNotNull} from '../utils/predicates'

type ArrayElement<ArrayType extends readonly unknown[] | null | undefined> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never

type LinearQuery = useLinearProjectsAndTeams_teamMember$data extends {
  integrations?: {linear?: {api?: {query?: infer Q | null} | null} | null} | null
}
  ? Q
  : never

export type Project = NonNullable<
  NonNullable<
    ArrayElement<LinearQuery extends {allProjects?: {edges?: infer E | null} | null} ? E : never>
  >['node']
>

export type Team = NonNullable<
  NonNullable<
    ArrayElement<LinearQuery extends {teams?: {edges?: infer E | null} | null} ? E : never>
  >['node']
>

export type LinearProjectOrTeam = Project | Team

type InputEdgeForGetNodeId = {
  node?: {readonly id: string} | null
}
const getNodeId = (edge: InputEdgeForGetNodeId) => {
  return edge?.node?.id
}

const getItemName = (item: LinearProjectOrTeam): string => {
  // If 'teams' is in item, it's a Project.
  // The getLinearRepoName function handles Project types correctly.
  // If not, it's a Team, and we fall back to item.name.
  return 'teams' in item ? getLinearRepoName(item) : item.name || 'Unknown Team'
}

export interface UseLinearProjectsAndTeamsResult {
  projectsAndTeams: ReadonlyArray<LinearProjectOrTeam>
  searchQuery: string
  setSearchQuery: (query: string) => void
  filteredProjectsAndTeams: ReadonlyArray<LinearProjectOrTeam>
}

const teamMemberFragment = graphql`
  fragment useLinearProjectsAndTeams_teamMember on TeamMember {
    integrations {
      linear {
        api {
          query {
            myProjects: projects(first: 100, filter: {members: {isMe: {eq: true}}}) {
              edges {
                node {
                  __typename
                  id
                  name
                  teams(first: 1) {
                    nodes {
                      displayName
                    }
                  }
                }
              }
            }
            allProjects: projects(first: 100) {
              edges {
                node {
                  __typename
                  id
                  name
                  teams(first: 1) {
                    nodes {
                      displayName
                    }
                  }
                }
              }
            }
            teams(first: 100) {
              edges {
                node {
                  __typename
                  id
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`

const useLinearProjectsAndTeams = (
  teamMemberRef: useLinearProjectsAndTeams_teamMember$key | null
): UseLinearProjectsAndTeamsResult => {
  const teamMember = useFragment(
    teamMemberFragment,
    teamMemberRef as useLinearProjectsAndTeams_teamMember$key
  )

  const linearQuery = teamMemberRef ? teamMember?.integrations?.linear?.api?.query : null

  const projectsAndTeams = useMemo(() => {
    if (!linearQuery) return []

    const nullableMyProjectEdges = linearQuery?.myProjects?.edges ?? []
    const nullableAllProjectEdges = linearQuery?.allProjects?.edges ?? []
    const nullableTeamEdges = linearQuery?.teams?.edges ?? []

    const allNullableProjectEdges = [...nullableMyProjectEdges, ...nullableAllProjectEdges]

    const uniqueProjectEdges = getUniqueEdges(getNonNullEdges(allNullableProjectEdges), getNodeId)
    const projects = uniqueProjectEdges.map(({node}) => node).filter(isNotNull)

    const uniqueTeamEdges = getUniqueEdges(getNonNullEdges(nullableTeamEdges), getNodeId)
    const teams = uniqueTeamEdges.map(({node}) => node).filter(isNotNull)

    return [...projects, ...teams] as LinearProjectOrTeam[]
  }, [linearQuery])

  const [searchQuery, setSearchQuery] = useState('')

  const filteredProjectsAndTeams = useMemo(() => {
    if (!searchQuery) {
      return projectsAndTeams
    }
    const lowerCaseQuery = searchQuery.toLowerCase()
    return projectsAndTeams.filter((item) =>
      getItemName(item).toLowerCase().includes(lowerCaseQuery)
    )
  }, [projectsAndTeams, searchQuery])

  return {
    projectsAndTeams,
    searchQuery,
    setSearchQuery,
    filteredProjectsAndTeams
  }
}

export default useLinearProjectsAndTeams
