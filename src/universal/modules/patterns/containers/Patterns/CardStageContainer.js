import React, {Component} from 'react';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import Example from '../../components/Example/Example';
import ExampleCode from '../../components/ExampleCode/ExampleCode';
import PropsTable from '../../components/PropsTable/PropsTable';
import CheckInCards from 'universal/modules/meeting/components/CheckInCards.js';

const demoCards = [
  {
    name: '@FirstKitty',
    image: 'https://placekitten.com/g/600/600',
    badge: null, // absent || active || present
    state: 'invited', // invited || not attending || fully present,
    isCurrent: false
  },
  {
    name: '@SecondKitty',
    image: 'https://placekitten.com/g/600/600',
    badge: null, // absent || active || present
    state: 'invited', // invited || not attending || fully present,
    isCurrent: false
  },
  {
    name: '@ThirdKitty',
    image: 'https://placekitten.com/g/600/600',
    badge: null, // absent || active || present
    state: 'invited', // invited || not attending || fully present,
    isCurrent: true
  },
  {
    name: '@FourthKitty',
    image: 'https://placekitten.com/g/600/600',
    badge: null, // absent || active || present
    state: 'invited', // invited || not attending || fully present,
    isCurrent: false
  },
  {
    name: '@FifthKitty',
    image: 'https://placekitten.com/g/600/600',
    badge: null, // absent || active || present
    state: 'invited', // invited || not attending || fully present,
    isCurrent: false
  }
];

const cardStage = <CheckInCards cards={demoCards} />;
const cardStageString = '<CheckInCards cards={demoCards} />';

const cardStagePropsList = [
  { name: 'cards', type: 'array',
    // eslint-disable-next-line max-len
    description: <span>This array is a set of users (name, image, badge, label, isCurrent) presented on Card components</span>
  }
];

// eslint-disable-next-line react/prefer-stateless-function
export default class CheckinCardsContainer extends Component {
  static propTypes = {
    // Define
  };

  render() {
    return (
      <div>

        <SectionHeader
          heading="CheckInCards"
          // eslint-disable-next-line max-len
          description="Cycles through active, previous and next cards [TODO: Add callback func prop to change current card]"
        />

        <Example>
          {cardStage}
          <ExampleCode>
            {cardStageString}
          </ExampleCode>
        </Example>

        <PropsTable propsList={cardStagePropsList} />

      </div>
    );
  }
}
