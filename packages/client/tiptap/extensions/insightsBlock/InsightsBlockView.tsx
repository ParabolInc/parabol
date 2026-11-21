import {type NodeViewProps, NodeViewWrapper} from '@tiptap/react'
import {useIsAuthenticated} from '../../../components/IsAuthenticatedProvider'
import type {InsightsBlockAttrs} from './InsightsBlock'
import {InsightsBlockDisabledNotice} from './InsightsBlockDisabledNotice'
import {InsightsBlockDisabledRoot} from './InsightsBlockDisabledRoot'
import {InsightsBlockEditing} from './InsightsBlockEditing'
import {InsightsBlockNoData} from './InsightsBlockNoData'
import {InsightsBlockResult} from './InsightsBlockResult'
export const InsightsBlockView = (props: NodeViewProps) => {
  const {node} = props
  const attrs = node.attrs as InsightsBlockAttrs
  const {editing, error, teamIds} = attrs
  const isLoggedIn = useIsAuthenticated()

  return (
    <NodeViewWrapper>
      <div className='relative m-0 w-full p-0 text-fg-primary'>
        <div className='flex flex-col rounded-sm bg-surface-well p-4'>
          {error === 'disabled' &&
            (isLoggedIn ? (
              <InsightsBlockDisabledRoot teamIds={teamIds} />
            ) : (
              <InsightsBlockDisabledNotice orgId={null} isOrgAdmin={false} />
            ))}
          {error === 'nodata' && <InsightsBlockNoData {...props} />}
          {!error &&
            (editing ? <InsightsBlockEditing {...props} /> : <InsightsBlockResult {...props} />)}
        </div>
      </div>
    </NodeViewWrapper>
  )
}
