import Panel from '../../../components/Panel/Panel'
import {useThemePreference} from '../../../components/ThemeProvider'
import useUpdateUserThemeMutation from '../../../mutations/useUpdateUserThemeMutation'
import type {ThemePreference} from '../../../utils/themePreference'
import ThemeOptionCard from './ThemeOptionCard'

const OPTIONS: {value: ThemePreference; label: string; sub: string}[] = [
  {value: 'light', label: 'Light', sub: 'Always light'},
  {value: 'dark', label: 'Dark', sub: 'Always dark'},
  {value: 'system', label: 'System', sub: 'Match your OS setting'}
]

const AppearancePanel = () => {
  const {preference, setPreference} = useThemePreference()
  const [execute] = useUpdateUserThemeMutation()

  const handleSelect = (next: ThemePreference) => {
    if (next === preference) return
    const previous = preference
    setPreference(next)
    execute({
      variables: {theme: next},
      onCompleted: (res) => {
        if (res.updateUserTheme.error) {
          setPreference(previous)
        }
      }
    })
  }

  return (
    <Panel label='Appearance' casing={'capitalize'}>
      <div className='border-hairline border-t p-4'>
        <p className='mb-4 text-fg-secondary text-sm leading-5'>
          Choose how Parabol looks to you. Select a single theme, or sync with your operating
          system.
        </p>
        <div className='flex flex-col gap-3 sm:flex-row' role='radiogroup' aria-label='Theme'>
          {OPTIONS.map(({value, label, sub}) => (
            <ThemeOptionCard
              key={value}
              value={value}
              label={label}
              sub={sub}
              selected={preference === value}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>
    </Panel>
  )
}

export default AppearancePanel
