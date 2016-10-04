import React, {Component} from 'react';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import Example from '../../components/Example/Example';
import ExampleCode from '../../components/ExampleCode/ExampleCode';
import PropsTable from '../../components/PropsTable/PropsTable';
import Background from 'universal/modules/team/components/Background/Background';
import Button from 'universal/components/Button/Button';

const button = <Button size="large" style="solid" colorPalette="warm" />;
const buttonString = '<Button size="large" style="solid" colorPalette="warm" />';
const buttonPropsList = [
  { name: 'disabled', type: 'bool',
    description: <span>Sets the boolean HTML attribute and causes disabled styling</span>
  },
  { name: 'label', type: 'string',
    description: <span>The visible button text. <b>Defaults</b> to “<i>Label Me</i>”</span>
  },
  { name: 'onClick', type: 'func',
    description: <span>Handler for when the button is clicked</span>
  },
  { name: 'size', type: 'oneOf',
    description: <span>smallest, small, medium (<b>default</b>), large, largest</span>
  },
  { name: 'style', type: 'oneOf',
    // eslint-disable-next-line max-len
    description: <span>solid (<b>default</b>), inverted (light over color background), outlined</span>
  },
  { name: 'theme', type: 'oneOf',
    // eslint-disable-next-line max-len
    description: <span>cool, warm, dark (<b>default</b>), mid, light, white</span>
  },
    { name: 'title', type: 'string',
    // eslint-disable-next-line max-len
    description: <span>Meaningful text for the title attribute. If none, will <b>default</b> to label string.</span>
  }
];

// eslint-disable-next-line react/prefer-stateless-function
export default class ButtonContainer extends Component {
  static propTypes = {
    // Define
  };

  render() {
    return (
      <div>

        <SectionHeader
          heading="Button"
          // eslint-disable-next-line max-len
          description="A general purpose button element with customizable theme colors and style options"
        />

        <Example>
          <Background align="center" theme="white">
            {button}
          </Background>
          <ExampleCode>
            {buttonString}
          </ExampleCode>
        </Example>

        <PropsTable propsList={buttonPropsList} />

      </div>
    );
  }
}
