import React, {Component} from 'react';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import Example from '../../components/Example/Example';
import ExampleCode from '../../components/ExampleCode/ExampleCode';
import PropsTable from '../../components/PropsTable/PropsTable';
import ProjectCard from 'universal/components/ProjectCard/ProjectCard';

const projectCard = <ProjectCard />;
const projectCardString = '<ProjectCard />';

// TODO: Add all props to demo
const projectCardPropsList = [
  { name: 'description', type: 'string',
    description: <span>A string of text describing the desired outcome</span>
  },
  { name: 'status', type: 'oneOf',
    description: <span>active, stuck, done, future</span>
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
          description="A ProjectCard component with avatar, label and optional controls"
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
