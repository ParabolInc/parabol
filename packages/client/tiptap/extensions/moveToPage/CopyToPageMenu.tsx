import useAtmosphere from '../../../hooks/useAtmosphere'
import {useDuplicatePageMutation} from '../../../mutations/useDuplicatePageMutation'
import {GQLID} from '../../../utils/GQLID'
import {runDuplicatePage} from '../../../utils/runDuplicatePage'
import type {MoveToPageAnchorRect} from '../../blockMove/openMoveToPageMenu'
import {getCopyDragState} from './getCopyDragState'
import MoveToPageMenu from './MoveToPageMenu'

interface Props {
  pageCode: number
  title: string
  anchorRect: MoveToPageAnchorRect
  onClose: (returnFocus: boolean) => void
}

const CopyToPageMenu = (props: Props) => {
  const {pageCode, title, anchorRect, onClose} = props
  const atmosphere = useAtmosphere()
  const [execute] = useDuplicatePageMutation()
  const shownTitle = title || 'Untitled'
  return (
    <MoveToPageMenu
      anchorRect={anchorRect}
      heading={`Copy "${shownTitle}" to`}
      drag={getCopyDragState(GQLID.toKey(pageCode, 'page'))}
      confirmVerb='copy'
      onClose={onClose}
      onPick={(targetId, targetTitle, navigate) => {
        runDuplicatePage({
          pageCode,
          title,
          destination: {kind: 'copyTo', parentPageId: targetId, title: targetTitle},
          execute,
          atmosphere,
          navigate
        })
        onClose(true)
      }}
    />
  )
}

export default CopyToPageMenu
