import {SlackIM, SlackPublicConversation} from './SlackManager'

export const isSlackIMArray = (
  channels: SlackPublicConversation[] | SlackIM[]
): channels is SlackIM[] => {
  return !!(channels as SlackIM[]).find((channel) => channel.is_im)
}
