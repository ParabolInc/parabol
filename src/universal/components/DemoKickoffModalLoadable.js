import {
  DEFAULT_MENU_HEIGHT,
  DEFAULT_MENU_WIDTH,
  HUMAN_ADDICTION_THRESH,
  MAX_WAIT_TIME
} from 'universal/styles/ui'
import Loadable from 'react-loadable'
import LoadableLoading from 'universal/components/LoadableLoading'
import React from 'react'

const DemoKickoffModalLoadable = Loadable({
  loader: () =>
    import(/* webpackChunkName: 'DemoKickoffModal' */
      'universal/components/DemoKickoffModal'),
  loading: (props) => (
    <LoadableLoading {...props} height={DEFAULT_MENU_HEIGHT} width={DEFAULT_MENU_WIDTH} />
  ),
  delay: HUMAN_ADDICTION_THRESH,
  timeout: MAX_WAIT_TIME
})

export default DemoKickoffModalLoadable
