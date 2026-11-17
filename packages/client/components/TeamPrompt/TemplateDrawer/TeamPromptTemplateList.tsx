import type {TeamPromptTemplateDrawerQuery$data} from '~/__generated__/TeamPromptTemplateDrawerQuery.graphql'
import TeamPromptTemplateCard from './TeamPromptTemplateCard'

type DrawerViewer = TeamPromptTemplateDrawerQuery$data['viewer']
type ListedTemplate = NonNullable<DrawerViewer['availableTemplates']>['edges'][number]['node']
type DrawerTeam = NonNullable<NonNullable<DrawerViewer['meeting']>['team']>

interface Props {
  templates: readonly ListedTemplate[]
  team: DrawerTeam
  currentTemplateId: string | null
  pendingTemplateId: string | null
  onPick: (template: {id: string; name: string}) => void
}

const TeamPromptTemplateList = (props: Props) => {
  const {templates, team, currentTemplateId, pendingTemplateId, onPick} = props
  const sections = [
    {
      label: team.name,
      templates: templates.filter(({scope, teamId}) => scope === 'TEAM' && teamId === team.id)
    },
    {
      label: team.organization.name,
      templates: templates.filter(({orgId, scope}) => orgId !== 'aGhostOrg' && scope !== 'TEAM')
    },
    {label: 'Parabol', templates: templates.filter(({orgId}) => orgId === 'aGhostOrg')}
  ].filter((section) => section.templates.length > 0)

  return (
    <div className='min-h-0 flex-1 overflow-y-auto px-4 pt-1 pb-6'>
      {sections.map((section) => (
        <section key={section.label} aria-label={section.label}>
          <h3 className='m-0 px-1 pt-4 pb-2 font-semibold text-[11px] text-fg-muted uppercase leading-4 tracking-wider'>
            {section.label}
          </h3>
          <div className='flex flex-col gap-2'>
            {section.templates.map((template) => (
              <TeamPromptTemplateCard
                key={template.id}
                templateRef={template}
                isCurrent={template.id === currentTemplateId}
                isPending={template.id === pendingTemplateId}
                isDisabled={!!pendingTemplateId}
                onPick={() => onPick(template)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export default TeamPromptTemplateList
