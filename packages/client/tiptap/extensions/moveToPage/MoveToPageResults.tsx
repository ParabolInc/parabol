import graphql from 'babel-plugin-relay/macro'
import {Fragment, useEffect, useMemo} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {MoveToPageResultsQuery} from '../../../__generated__/MoveToPageResultsQuery.graphql'
import {EmptyDropdownMenuItemLabel} from '../../../components/EmptyDropdownMenuItemLabel'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {MenuSeparator} from '../../../ui/Menu/MenuSeparator'
import type {BlockDragState} from '../../blockMove/getBlockDropRefusal'
import {
  getMoveTargetRows,
  type MoveTargetPage,
  type MoveTargetRow
} from '../../blockMove/getMoveTargetRows'
import MoveToPageMenuItem from './MoveToPageMenuItem'

const query = graphql`
  query MoveToPageResultsQuery($textFilter: String!) {
    viewer {
      teams {
        id
        name
      }
      pages(first: 100, textFilter: $textFilter) {
        edges {
          node {
            id
            title
            updatedAt
            parentPageId
            teamId
            isPrivate
            isDatabase
            isMeetingTOC
            ancestorIds
            access {
              viewer
            }
            parentPage {
              title
            }
          }
        }
      }
    }
  }
`

export type MoveToPageFirstAllowed = {row: MoveTargetRow | null; textFilter: string}

interface Props {
  queryRef: PreloadedQuery<MoveToPageResultsQuery>
  drag: BlockDragState
  onPick: (pageId: string, title: string) => void
  onFirstAllowed: (first: MoveToPageFirstAllowed) => void
}

const MoveToPageResults = (props: Props) => {
  const {queryRef, drag, onPick, onFirstAllowed} = props
  const {viewer} = usePreloadedQuery<MoveToPageResultsQuery>(query, queryRef)
  const atmosphere = useAtmosphere()
  const {textFilter} = queryRef.variables
  const sourceParentId = atmosphere.getStore().getSource().get(drag.sourcePageId)?.parentPageId
  const sourceParentPageId = typeof sourceParentId === 'string' ? sourceParentId : null
  const {allowed, refused} = useMemo(() => {
    const pages = viewer.pages.edges.map(
      ({node}): MoveTargetPage => ({
        id: node.id,
        title: node.title ?? null,
        updatedAt: node.updatedAt ?? null,
        parentPageId: node.parentPageId ?? null,
        teamId: node.teamId ?? null,
        isPrivate: node.isPrivate ?? null,
        isDatabase: node.isDatabase ?? null,
        isMeetingTOC: node.isMeetingTOC ?? null,
        viewerRole: node.access.viewer,
        ancestorIds: node.ancestorIds,
        parentTitle: node.parentPage ? (node.parentPage.title ?? '') : null
      })
    )
    const teamNames = new Map(viewer.teams.map(({id, name}) => [id, name]))
    return getMoveTargetRows(pages, {
      query: textFilter,
      sourcePageId: drag.sourcePageId,
      sourceParentPageId,
      teamNames,
      drag
    })
  }, [viewer, textFilter, drag, sourceParentPageId])
  const firstAllowed = allowed[0] ?? null
  useEffect(() => {
    onFirstAllowed({row: firstAllowed, textFilter})
  }, [firstAllowed, textFilter, onFirstAllowed])

  if (allowed.length + refused.length === 0) {
    return <EmptyDropdownMenuItemLabel>No pages found</EmptyDropdownMenuItemLabel>
  }
  return [...allowed, ...refused].map((row, index) => (
    <Fragment key={row.pageId}>
      {index > 0 && index === allowed.length && <MenuSeparator />}
      <MoveToPageMenuItem row={row} onPick={onPick} />
    </Fragment>
  ))
}

export default MoveToPageResults
