import React, {Component} from 'react';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import Example from '../../components/Example/Example';
import ExampleCode from '../../components/ExampleCode/ExampleCode';
import PropsTable from '../../components/PropsTable/PropsTable';
import ProjectCard from 'universal/components/ProjectCard/ProjectCard';

const projectCard = <ProjectCard showByTeam />;
const projectCardString = '<ProjectCard showByTeam />';

// TODO: Add all props to demo
const projectCardPropsList = [
  { name: 'TBD', type: 'TBD',
    description: <span>TBD: Component is actively being developed…</span>
  }
];

// eslint-disable-next-line react/prefer-stateless-function
export default class CardContainer extends Component {
  static propTypes = {
    // Define
  };

  render() {
    return (
      <div>

        <SectionHeader
          heading="ProjectCard"
          // eslint-disable-next-line max-len
          description="A ProjectCard component with description, timestamp, owner/team, and status"
        />

        <Example>
          {projectCard}
          <ExampleCode>
            {projectCardString}
          </ExampleCode>
        </Example>

        <PropsTable propsList={projectCardPropsList} />

      </div>
    );
  }
}
