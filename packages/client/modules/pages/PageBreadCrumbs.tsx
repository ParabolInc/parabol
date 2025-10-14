import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useRef} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import {Link} from 'react-router-dom'
import type {PageBreadCrumbs_page$key} from '../../__generated__/PageBreadCrumbs_page.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import {getPageSlug} from '../../tiptap/getPageSlug'
import {Menu} from '../../ui/Menu/Menu'
import {MenuItem} from '../../ui/Menu/MenuItem'

interface Props {
  pageRef: PageBreadCrumbs_page$key
}

const useSetCurrentPageAncestor = (pageId: string, ancestors: readonly {readonly id: string}[]) => {
  const atmosphere = useAtmosphere()
  const lastPageIds = useRef<string[]>([])
  useEffect(() => {
    const pageIds = [pageId, ...ancestors.map(({id}) => id).reverse()]
    commitLocalUpdate(atmosphere, (store) => {
      pageIds.forEach((pageId, idx) => {
        store.get(pageId)?.setValue(idx, 'currentPageAncestorDepth')
      })
    })
    lastPageIds.current = pageIds
    return () => {
      commitLocalUpdate(atmosphere, (store) => {
        lastPageIds.current.forEach((pageId) => {
          store.get(pageId)?.setValue(undefined, 'currentPageAncestorDepth')
        })
      })
    }
  }, [pageId, ancestors])
}
export const PageBreadCrumbs = (props: Props) => {
  const {pageRef} = props
  const page = useFragment(
    graphql`
      fragment PageBreadCrumbs_page on Page {
        id
        title
        team {
          id
          name
        }
        ancestors {
          id
          title
          team {
            id
            name
          }
        }
      }
    `,
    pageRef
  )
  const {ancestors, id, title, team} = page
  const self = {id, title}
  useSetCurrentPageAncestor(id, ancestors)
  let visibleAncestors: typeof ancestors = []
  let hiddenAncestors: typeof ancestors = []

  if (ancestors.length <= 2) {
    visibleAncestors = ancestors
  } else {
    visibleAncestors = [
      ancestors[0]!, // Oldest ancestor
      ancestors[ancestors.length - 1]! // Parent
    ] as const
    hiddenAncestors = ancestors.slice(1, -1) // All middle ancestors
  }
  const renderTeamCrumb = (team: {id: string; name: string}) => {
    return (
      <>
        <Link
          draggable={false}
          to={`/team/${team.id}`}
          className='rounded-md px-1 hover:bg-slate-200'
        >
          {team.name}
        </Link>
        <span className='px-1'>/</span>
      </>
    )
  }
  const renderBreadcrumbItem = (page: (typeof ancestors)[number]) => (
    <React.Fragment key={page.id}>
      {page.team && renderTeamCrumb(page.team)}
      <Link
        draggable={false}
        to={`/pages/${getPageSlug(Number(page.id.split(':')[1]), page.title)}`}
        className='rounded-md px-1 hover:bg-slate-200'
      >
        {page.title}
      </Link>
      <span className='px-1'>/</span>
    </React.Fragment>
  )

  return (
    <nav className='flex items-center pl-2 text-slate-600 text-sm'>
      {/* Oldest ancestor (if any) */}
      {visibleAncestors.length > 0 && renderBreadcrumbItem(visibleAncestors[0]!)}

      {/* Ellipsis dropdown */}
      {hiddenAncestors.length > 0 && (
        <>
          <Menu
            trigger={
              <button
                className='cursor-pointer rounded-md bg-white px-1 hover:bg-slate-200'
                aria-label='Open ancestor menu'
              >
                …
              </button>
            }
          >
            <DropdownMenu.Content className='rounded bg-white p-2 shadow-md' sideOffset={5}>
              {hiddenAncestors.map((page) => (
                <MenuItem key={page.id} className='rounded p-1 hover:bg-slate-200'>
                  <Link
                    draggable={false}
                    to={`/pages/${getPageSlug(Number(page.id.split(':')[1]), page.title)}`}
                  >
                    {page.title}
                  </Link>
                </MenuItem>
              ))}
            </DropdownMenu.Content>
          </Menu>
          <span className='px-1'>/</span>
        </>
      )}

      {/* Parent (if any and different from oldest ancestor) */}
      {visibleAncestors.length > 1 && renderBreadcrumbItem(visibleAncestors[1]!)}

      {/* Self (not a link) */}
      {ancestors.length === 0 && team && renderTeamCrumb(team)}
      <span className='font-medium text-slate-900'>{self.title}</span>
    </nav>
  )
}
