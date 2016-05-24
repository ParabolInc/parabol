import React, {Component} from 'react';
import Helmet from 'react-helmet';
import {head} from 'universal/utils/clientOptions';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import Example from '../../components/Example/Example';
import ExampleCode from '../../components/ExampleCode/ExampleCode';
import PropsTable from '../../components/PropsTable/PropsTable';
import Button from 'universal/modules/meeting/components/Button/Button';

// TODO: Each component demo (like 'button') should have a container.
//       This parent container will wrap those containers.

const button = <Button size="medium" style="outlined" theme="warm" />;
const buttonString = '<Button size="medium" style="outlined" theme="warm" />';
const buttonPropsList = [
  { name: 'disabled', type: 'bool',
    description: <span>Sets the boolean HTML attribute and causes disabled styling</span>
  },
  { name: 'label', type: 'string',
    description: <span>The visible button text. Defaults to “<i>Label Me</i>”</span>
  },
  { name: 'onClick', type: 'func',
    description: <span>Handler for when the button is clicked</span>
  },
  { name: 'size', type: 'string',
    description: <span>Size options: smallest, small, medium (<b>default</b>), large, largest</span>
  },
  { name: 'style', type: 'string',
    // eslint-disable-next-line max-len
    description: <span>Style options: solid (<b>default</b>), inverted (light over color background), outlined</span>
  },
  { name: 'theme', type: 'string',
    description: <span>Theme palette value: cool, warm, dark (<b>default</b>), mid, light</span>
  },
    { name: 'title', type: 'string',
    // eslint-disable-next-line max-len
    description: <span>Meaningful text for the title attribute. If none, will <b>default</b> to label string.</span>
  }
];

// eslint-disable-next-line react/prefer-stateless-function
export default class PatternsContainer extends Component {
  static propTypes = {
    // Define
  };

  render() {
    return (
      <div style={{margin: '0 auto', maxWidth: '80rem'}}>
        <Helmet title="Welcome to the Action Pattern Library" {...head} />

        <h1>Pattern Library</h1>

        {/*
            TODO: Each component demo (like 'button') should have a container.
                  This parent container will wrap those containers.
        */}

        <SectionHeader
          heading="Button"
          description="A general purpose button element with customizable colors"
        />

        <Example>
          {button}
          <ExampleCode>
            {buttonString}
          </ExampleCode>
        </Example>

        <PropsTable propsList={buttonPropsList} />

      </div>
    );
  }
}
