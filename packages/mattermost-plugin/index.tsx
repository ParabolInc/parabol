import * as Tooltip from '@radix-ui/react-tooltip'
import {AnyAction, Store} from '@reduxjs/toolkit'
import {GlobalState} from 'mattermost-redux/types/store'
import SidePanelRoot from './components/Sidepanel'
import PanelTitle from './components/Sidepanel/PanelTitle'
import manifest from './manifest'
import rootReducer, {
  connect,
  openConfigureNotificationsModal,
  openCreateTaskModal,
  openInviteToMeetingModal,
  openInviteToTeamModal,
  openPushPostAsReflection,
  openStartActivityModal
} from './reducers'
import {getAssetsUrl, getPluginServerRoute, isAuthorized} from './selectors'
import {ContextArgs, PluginRegistry} from './types/mattermost-webapp'

import {createEnvironment} from './Atmosphere'
import AtmosphereProvider from './AtmosphereProvider'
import AutoLogin from './components/AutoLogin'
import ModalRoot from './components/ModalRoot'
import './index.css'
import commands from './plugin-commands.json'

export const init = async (registry: PluginRegistry, store: Store<GlobalState, AnyAction>) => {
  const serverUrl = getPluginServerRoute(store.getState())
  const environment = createEnvironment(serverUrl, store)

  registry.registerReducer(rootReducer)
  registry.registerRootComponent(() => (
    <AtmosphereProvider environment={environment}>
      <AutoLogin />
    </AtmosphereProvider>
  ))
  registry.registerRootComponent(() => (
    <AtmosphereProvider environment={environment}>
      <Tooltip.Provider>
        <ModalRoot />
      </Tooltip.Provider>
    </AtmosphereProvider>
  ))
  const {toggleRHSPlugin, showRHSPlugin} = registry.registerRightHandSidebarComponent(
    () => (
      <AtmosphereProvider environment={environment}>
        <SidePanelRoot />
      </AtmosphereProvider>
    ),
    <AtmosphereProvider environment={environment}>
      <PanelTitle />
    </AtmosphereProvider>
  )
  registry.registerChannelHeaderButtonAction(
    <img src={`${getAssetsUrl(store.getState())}/parabol.png`} />,
    () => store.dispatch(toggleRHSPlugin),
    'Open Parabol Panel'
  )

  registry.registerSlashCommandWillBePostedHook(async (message: string, args: ContextArgs) => {
    const [command, subcommand] = message.split(/\s+/)
    if (command === '/parabol') {
      if (!isAuthorized(store.getState())) {
        const loggedIn = await environment.login()
        if (loggedIn) {
          return {}
        }
        store.dispatch(showRHSPlugin)
        return {
          error: {
            message: 'You are not logged in to Parabol. Please log in to Parabol and retry.'
          }
        }
      }
      if (subcommand === 'connect') {
        store.dispatch(connect({commands}) as any)
        environment.login()
        return {}
      }
    }
    return {message, args}
  })

  registry.registerWebSocketEventHandler(`custom_${manifest.id}_start`, () => {
    store.dispatch(openStartActivityModal())
  })

  registry.registerWebSocketEventHandler(`custom_${manifest.id}_task`, () => {
    store.dispatch(openCreateTaskModal())
  })

  registry.registerWebSocketEventHandler(`custom_${manifest.id}_invite`, () => {
    store.dispatch(openInviteToTeamModal())
  })

  registry.registerWebSocketEventHandler(`custom_${manifest.id}_share`, () => {
    store.dispatch(openInviteToMeetingModal())
  })

  registry.registerWebSocketEventHandler(`custom_${manifest.id}_notifications`, () => {
    store.dispatch(openConfigureNotificationsModal(''))
  })

  store.dispatch(connect({commands}) as any)

  registry.registerPostDropdownMenuAction(
    <div>
      <span className='MenuItem__icon'>
        <img src={`${getAssetsUrl(store.getState())}/parabol.png`} />
      </span>
      Push reflection to Parabol
    </div>,
    (postId: string) => store.dispatch(openPushPostAsReflection(postId))
  )

  console.log(`${manifest.id} Initialized plugin`)
}
