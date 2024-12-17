import React from 'react'

export type ContextArgs = {channel_id: string}

type FormatTextOptions = {
  atMentions?: boolean
  markdown?: boolean
}

type MessageHtmlToComponentOptions = {
  mentionHighlight: boolean
}

export interface PluginRegistry {
  registerReducer(reducer)
  registerChannelHeaderButtonAction(icon: Reast.ReactNode, action: () => void, tooltipText: string)
  registerPostTypeComponent(typeName: string, component: React.ElementType)
  registerRightHandSidebarComponent(component: React.ReactNode, title: string | JSX.Element)
  registerSlashCommandWillBePostedHook(
    hook: (rawMessage: string, contextArgs: ContextArgs) => Promise<{}>
  )
  registerWebSocketEventHandler(event: string, handler: (msg: any) => void)
  registerAppBarComponent(iconUrl: string, action: () => void, tooltipText: string)
  registerLeftSidebarHeaderComponent(component: React.ReactNode)
  registerBottomTeamSidebarComponent(component: React.ReactNode)
  registerPopoverUserAttributesComponent(component: React.ReactNode)
  registerLinkTooltipComponent(component: React.ReactNode)
  registerReconnectHandler(handler: any)
  registerPostDropdownMenuComponent(component: React.ReactNode)
  registerPostDropdownMenuAction(component: React.ReactNode, action: (postId: string) => void)
  registerRootComponent(component: React.ElementType)

  // Add more if needed from https://developers.mattermost.com/extend/plugins/webapp/reference
}
