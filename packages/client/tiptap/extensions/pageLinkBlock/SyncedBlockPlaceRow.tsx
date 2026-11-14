import {useNavigate} from 'react-router'
import {DeleteOutlined, Description} from '~/ui/icons'
import {MenuItem} from '../../../ui/Menu/MenuItem'
import {GQLID} from '../../../utils/GQLID'
import {getPageSlug} from '../../getPageSlug'
import type {SyncedBlockPlaceRow as Row} from './getSyncedBlockPlaces'
import {SyncedBlockTag} from './SyncedBlockTag'
import {syncedBlockPlaceRowClass} from './syncedBlockPlaceRowClass'

interface Props {
  row: Row
}

export const SyncedBlockPlaceRow = ({row}: Props) => {
  const {pageId, title, isOriginal, isThisPage, isInTrash} = row
  const navigate = useNavigate()
  const Icon = isInTrash ? DeleteOutlined : Description
  const content = (
    <>
      <Icon className='shrink-0 text-[18px] text-fg-secondary' />
      <span className='min-w-0 flex-auto'>
        <span className='block truncate'>{title}</span>
        {isInTrash && <span className='block text-fg-secondary text-xs'>In Trash</span>}
      </span>
      {(isThisPage || isOriginal) && (
        <SyncedBlockTag className='bg-[color-mix(in_srgb,currentColor_18%,var(--color-surface-modal))] text-fg-secondary'>
          {isThisPage ? 'This page' : 'Original'}
        </SyncedBlockTag>
      )}
    </>
  )
  if (isThisPage) return <div className={syncedBlockPlaceRowClass}>{content}</div>
  const [pageCode] = GQLID.fromKey(pageId)
  return (
    <MenuItem
      className='min-h-8 gap-2'
      onSelect={() => navigate(`/pages/${getPageSlug(pageCode, title)}`)}
    >
      {content}
    </MenuItem>
  )
}
