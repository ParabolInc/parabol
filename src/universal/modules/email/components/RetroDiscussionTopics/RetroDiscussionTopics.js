import PropTypes from 'prop-types';
import React from 'react';
// import appTheme from 'universal/styles/theme/appTheme';
// import ui from 'universal/styles/ui';

const ExampleTopic = {
  theme: 'Support',
  voteCount: 7,
  reflections: [
    {
      content: 'This is my pithy reflection'
    },
    {
      content: 'This is my pithy reflection'
    },
    {
      content: 'This is my pithy reflection'
    }
  ]
};

const ExampleTopics = [
  ...ExampleTopic,
  ...ExampleTopic,
  ...ExampleTopic,
  ...ExampleTopic,
  ...ExampleTopic
];

const TopicThemeHeading = {
  fontSize: '13px',
  fontWeight: 600
};

const VoteIcon = {
  display: 'inline-block',
  margin: '0 4px'
};

const ReflectionCard = {
  border: '1px solid gray',
  borderRadius: '4px',
  padding: '8px'
};

const RetroDiscussionTopics = (props) => {
  const {
    topics
  } = props;

  const theTopics = topics || ExampleTopics;

  const makeVotes = (count) => {
    const Votes = [];
    if (Votes.length < count) Votes.push(<div>Vote</div>);
    return Votes;
  };

  const makeCard = (reflection) => (
    <div style={ReflectionCard}>
      {reflection.content}
    </div>
  );

  const makeTopic = (topic) => {
    const {reflections} = topic;
    return (
      <table width="100%">
        <tbody>
          <tr>
            <td>
              {topic.theme}
            </td>
          </tr>
          <tr>
            <td>
              {makeVotes(topic.voteCount)}
            </td>
          </tr>
          <tr>
            <td>
              {reflections.map((reflection) => makeCard(reflection))}
            </td>
          </tr>
        </tbody>
      </table>
    )
  };


  return (
    <table width="100%">
      <tbody>
        <tr>
          <td>
            {theTopics.maps((topic) => makeTopic(topic))}
          </td>
        </tr>
      </tbody>
    </table>
  );
};

RetroDiscussionTopics.propTypes = {
  topics: PropTypes.array
};

export default RetroDiscussionTopics;
