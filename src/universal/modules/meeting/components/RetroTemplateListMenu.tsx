import React, {Component} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import MenuItemHR from 'universal/components/MenuItemHR'
import MenuItemWithShortcuts from 'universal/components/MenuItemWithShortcuts'
import MenuWithShortcuts from 'universal/components/MenuWithShortcuts'
import {WithAtmosphereProps} from 'universal/decorators/withAtmosphere/withAtmosphere'

interface Props extends WithAtmosphereProps {
  closePortal: () => void
  reflectTemplates: any
}

class RetroTemplateListMenu extends Component<Props> {
  render() {
    const {closePortal, reflectTemplates} = this.props

    return (
      <MenuWithShortcuts
        ariaLabel={'Select a template or create your own!'}
        closePortal={closePortal}
      >
        {reflectTemplates.map((template) => {
          const {templateId, name} = template
          return (
            <MenuItemWithShortcuts
              key={templateId}
              label={name}
              onClick={() => console.log('selected', name)}
            />
          )
        })}
        <MenuItemHR notMenuItem />
        <MenuItemWithShortcuts label="Customize..." onClick={() => console.log('customize')} />
      </MenuWithShortcuts>
    )
  }
}

export default createFragmentContainer(
  RetroTemplateListMenu,
  graphql`
    fragment RetroTemplateListMenu_reflectTemplates on ReflectTemplate @relay(plural: true) {
      templateId: id
      name
    }
  `
)
