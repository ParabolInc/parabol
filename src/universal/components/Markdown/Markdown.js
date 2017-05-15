import PropTypes from 'prop-types';
import React, { Component } from 'react';
import MarkdownIt from 'markdown-it';
import emoji from 'markdown-it-emoji';

const options = {
  breaks: true,
  linkify: true,
  typographer: true
};

class Markdown extends Component {
  static propTypes = {
    source: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.md = new MarkdownIt(options);
    this.md.use(emoji);
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.source !== this.props.source;
  }

  render() {
    const {source} = this.props;
    if (!source) return null;
    // eslint-disable-next-line react/no-danger
    return <span dangerouslySetInnerHTML={{__html: this.md.render(source)}} />;
  }
}

export default Markdown;
