import {AnyAction, Store} from '@reduxjs/toolkit'
import {GlobalState} from 'mattermost-redux/types/store'
import SidePanelRoot from './components/Sidepanel'
import PanelTitle from './components/Sidepanel/PanelTitle'
import manifest from './manifest'
import rootReducer, {
  openCreateTaskModal,
  openInviteToMeetingModal,
  openInviteToTeamModal,
  openPushPostAsReflection,
  openStartActivityModal
} from './reducers'
import {getAssetsUrl, getPluginServerRoute} from './selectors'
import {PluginRegistry} from './types/mattermost-webapp'

import {createEnvironment} from './Atmosphere'
import AtmosphereProvider from './AtmosphereProvider'
import ModalRoot from './components/ModalRoot'

export const init = async (registry: PluginRegistry, store: Store<GlobalState, AnyAction>) => {
  const serverUrl = getPluginServerRoute(store.getState())
  const environment = createEnvironment(serverUrl, store)
  /*registry.registerSlashCommandWillBePostedHook((message: string) => {
    return message
  })
   */

  registry.registerReducer(rootReducer)

  registry.registerRootComponent(() => (
    <AtmosphereProvider environment={environment}>
      <ModalRoot />
    </AtmosphereProvider>
  ))
  const {toggleRHSPlugin} = registry.registerRightHandSidebarComponent(
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

  registry.registerPostDropdownMenuAction(
    <div>
      <span className='MenuItem__icon'>
        <img src={`${getAssetsUrl(store.getState())}/parabol.png`} />
      </span>
      Push reflection to Parabol
    </div>,
    (postId: string) => store.dispatch(openPushPostAsReflection(postId))
  )

  console.log(`Initialized plugin ${manifest.id}`)
}
