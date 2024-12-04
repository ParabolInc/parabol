import graphql from 'babel-plugin-relay/macro'
import {readFragment} from 'relay-runtime'
import {Client4} from "mattermost-redux/client"
import {Options} from "mattermost-redux/types/client4"
import {LiveState, suspenseSentinel} from "relay-runtime"
import {ResolverContext} from "./Atmosphere"
import {resolversUserLinkedTeamsFragment$key} from './__generated__/resolversUserLinkedTeamsFragment.graphql'

/**
 * @RelayResolver Query.greeting: String
 */
export function greeting(): string {
  return "Hello World"
}

const fetchOnce = <T>(url: string, options: Options): LiveState<T> => {
  const letsGo = async () => {
    const res = await fetch(url, Client4.getOptions(options))
    const json = await res.json()
    return json
  }

  let result: T | null = null
  const callbacks = new Set<() => void>()
  letsGo().then((res) => {
    result = res
    callbacks.forEach((cb) => cb())
  })

  return {
    read: () => {
      if (!result) {
        return suspenseSentinel()
      }
      return result
    },
    subscribe: (callback: () => void) => {
      callbacks.add(callback)
      return () => {
        callbacks.delete(callback)
      }
    }
  }
}

/**
 * @RelayResolver Config
 * @weak
 */
export type ConfigSource = {
  parabolUrl: string
}

/**
 * @RelayResolver Query.config: Config
 * @live
 */
export function config(_args: any, context: ResolverContext): LiveState<ConfigSource> {
  return fetchOnce(`${context.serverUrl}/config`, {
    method: 'GET',
  })
}

/**
 * @RelayResolver Config.parabolUrl: String
 * Should be unneccessary, but querying the field doesn't work otherwise
 */
export function parabolUrl(config: ConfigSource): string {
  return config.parabolUrl
}

/**
 * @RelayResolver User.linkedTeamIds(channel: ID!): [ID!]
 * @live
 */
export function linkedTeamIds({channel}: {channel: string}, context: ResolverContext): LiveState<string[]> {
  return fetchOnce(`${context.serverUrl}/linkedTeams/${channel}`, {
    method: 'GET',
  })
}

/**
 * @RelayResolver User.linkedTeams: [Team!]
 * @rootFragment resolversUserLinkedTeamsFragment
 * @live
 */
export function linkedTeams(userRef: resolversUserLinkedTeamsFragment$key): string {
  const user = readFragment(graphql`
    fragment resolversUserLinkedTeamsFragment on User @argumentDefinitions(channel: {type: "ID!"}) {
      teams {
        id
      }
      linkedTeamIds(channel: $channel)
    }
  `, userRef)
  return user.linkedTeamIds.map((id) => user.teams.find((team) => team.id === id))
}
