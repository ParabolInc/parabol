import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {RetroTemplateList_templates$key} from '../../__generated__/RetroTemplateList_templates.graphql'
import RetroTemplateCard from './RetroTemplateCard'

interface Props {
  templatesRef: RetroTemplateList_templates$key
  team: {id: string; name: string; organization: {name: string}}
  query: string
  currentTemplateId: string | null
  pendingTemplateId: string | null
  onPick: (template: {id: string; name: string}) => void
}

const RetroTemplateList = (props: Props) => {
  const {templatesRef, team, query, currentTemplateId, pendingTemplateId, onPick} = props
  const templates = useFragment(
    graphql`
      fragment RetroTemplateList_templates on MeetingTemplate @relay(plural: true) {
        ...RetroTemplateCard_template
        id
        name
        orgId
        teamId
        scope
        ... on PromptTemplate {
          prompts {
            question
            description
          }
        }
      }
    `,
    templatesRef
  )
  const [expansionChoices, setExpansionChoices] = useState<{
    needle: string
    isExpandedById: Record<string, boolean>
  }>({needle: '', isExpandedById: {}})
  const needle = query.trim().toLowerCase()
  const isExpandedById = expansionChoices.needle === needle ? expansionChoices.isExpandedById : {}
  const isNameMatch = (template: (typeof templates)[number]) =>
    template.name.toLowerCase().includes(needle)
  const isPromptMatch = (template: (typeof templates)[number]) =>
    !!needle &&
    (template.prompts ?? []).some(({question, description}) =>
      `${question} ${description}`.toLowerCase().includes(needle)
    )
  const matches = templates.filter(
    (template) => !needle || isNameMatch(template) || isPromptMatch(template)
  )
  const sections = [
    {
      label: team.name,
      templates: matches.filter(({scope, teamId}) => scope === 'TEAM' && teamId === team.id)
    },
    {
      label: team.organization.name,
      templates: matches.filter(({orgId, scope}) => orgId !== 'aGhostOrg' && scope !== 'TEAM')
    },
    {label: 'Parabol', templates: matches.filter(({orgId}) => orgId === 'aGhostOrg')}
  ].filter((section) => section.templates.length > 0)

  if (sections.length === 0) {
    return (
      <p className='m-0 px-6 py-8 text-center text-fg-secondary text-sm'>
        {`No templates or prompts match “${query.trim()}”`}
      </p>
    )
  }
  return (
    <div className='min-h-0 flex-1 overflow-y-auto px-4 pb-6'>
      {sections.map((section) => (
        <section key={section.label} aria-label={section.label}>
          <h3 className='m-0 px-1 pt-4 pb-2 font-semibold text-[11px] text-fg-muted uppercase leading-4 tracking-wider'>
            {section.label}
          </h3>
          <div className='flex flex-col gap-2'>
            {section.templates.map((template) => {
              const isExpanded =
                isExpandedById[template.id] ?? (isPromptMatch(template) && !isNameMatch(template))
              return (
                <RetroTemplateCard
                  key={template.id}
                  templateRef={template}
                  searchQuery={needle}
                  isCurrent={template.id === currentTemplateId}
                  isPending={template.id === pendingTemplateId}
                  isExpanded={isExpanded}
                  onPick={() => onPick(template)}
                  onToggleExpanded={() =>
                    setExpansionChoices({
                      needle,
                      isExpandedById: {...isExpandedById, [template.id]: !isExpanded}
                    })
                  }
                />
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

export default RetroTemplateList
