import {slashCommands} from '../../slashCommand/slashCommands'
import {turnIntoRows} from '../turnIntoRows'

const commands = slashCommands.flatMap((group): {title: string; icon: unknown}[] => [
  ...group.commands
])

test('a row has the same name and icon as its slash command', () => {
  turnIntoRows
    .filter(({title}) => title !== 'Page')
    .forEach(({title, icon}) => {
      expect(commands.find((command) => command.title === title)?.icon).toBe(icon)
    })
})

test('the page row uses the icon for creating a page', () => {
  const pageRow = turnIntoRows.find(({title}) => title === 'Page')
  const createPage = commands.find((command) => command.title === 'Create page')
  expect(pageRow?.icon).toBe(createPage?.icon)
})
