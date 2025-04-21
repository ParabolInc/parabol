import graphql from 'babel-plugin-relay/macro'
import {useMemo, useState} from 'react'
import {useFragment} from 'react-relay'
import {
  useLinearProjectsAndTeams_teamMember$data,
  useLinearProjectsAndTeams_teamMember$key
} from '../__generated__/useLinearProjectsAndTeams_teamMember.graphql'
import getNonNullEdges from '../utils/getNonNullEdges'
import getUniqueEdges from '../utils/getUniqueEdges'
import {isNotNull} from '../utils/predicates'

type ArrayElement<ArrayType extends readonly unknown[] | null | undefined> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never

// Safely extract the type of the 'query' object, handling nulls along the path
type LinearQuery = useLinearProjectsAndTeams_teamMember$data extends {
  integrations?: {linear?: {api?: {query?: infer Q | null} | null} | null} | null
}
  ? Q
  : never

type AllProjectEdges = LinearQuery extends {allProjects?: {edges?: infer E | null} | null}
  ? E
  : never

type TeamEdges = LinearQuery extends {teams?: {edges?: infer E | null} | null} ? E : never

type ProjectEdge = NonNullable<ArrayElement<AllProjectEdges>>
type TeamEdge = NonNullable<ArrayElement<TeamEdges>>

export type Project = NonNullable<ProjectEdge['node']>
export type Team = NonNullable<TeamEdge['node']>

export type LinearProjectOrTeam = Project | Team

const getNodeId = (edge: ProjectEdge | TeamEdge) => {
  return edge?.node?.id
}

const linearProjectNameWithTeam = (project: Project): string => {
  const {name: projectName, teams} = project
  const teamName = teams?.nodes?.[0]?.displayName
  return teamName ? `${teamName}/${projectName}` : projectName || 'Unknown Project'
}

const getItemName = (item: LinearProjectOrTeam): string => {
  return 'teams' in item ? linearProjectNameWithTeam(item) : item.name || 'Unknown Team'
}

export interface UseLinearProjectsAndTeamsResult {
  projectsAndTeams: ReadonlyArray<LinearProjectOrTeam>
  searchQuery: string
  setSearchQuery: (query: string) => void
  filteredProjectsAndTeams: ReadonlyArray<LinearProjectOrTeam>
  // isLoading and error handling can be added based on Relay's suspense/error boundary patterns if needed
}

const useLinearProjectsAndTeams = (
  teamMemberRef: useLinearProjectsAndTeams_teamMember$key
): UseLinearProjectsAndTeamsResult => {
  const teamMember = useFragment(
    graphql`
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
    `,
    teamMemberRef
  )

  const linearQuery = teamMember?.integrations?.linear?.api?.query

  const projectsAndTeams = useMemo(() => {
    const nullableMyProjectEdges = linearQuery?.myProjects?.edges ?? []
    const nullableAllProjectEdges = linearQuery?.allProjects?.edges ?? []
    const nullableTeamEdges = linearQuery?.teams?.edges ?? []

    const allNullableProjectEdges = [...nullableMyProjectEdges, ...nullableAllProjectEdges]

    const uniqueProjectEdges = getUniqueEdges(getNonNullEdges(allNullableProjectEdges), getNodeId)
    const projects = uniqueProjectEdges.map(({node}) => node).filter(isNotNull) // Removed 'as Project[]'

    const uniqueTeamEdges = getUniqueEdges(getNonNullEdges(nullableTeamEdges), getNodeId)
    const teams = uniqueTeamEdges.map(({node}) => node).filter(isNotNull) // Removed 'as Team[]'

    // Cast might still be needed as TS struggles with the union type here
    return (projects as LinearProjectOrTeam[]).concat(teams as LinearProjectOrTeam[])
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
