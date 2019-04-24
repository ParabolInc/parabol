import ms from 'ms'
import React, {Component} from 'react'
import styled from 'react-emotion'
import Row from 'universal/components/Row/Row'
import SecondaryButton from 'universal/components/SecondaryButton'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import ServiceDropdownInput from 'universal/modules/integrations/components/ServiceDropdownInput/ServiceDropdownInput'
import AddSlackChannelMutation from 'universal/mutations/AddSlackChannelMutation'
import formError from 'universal/styles/helpers/formError'
import {Layout} from 'universal/types/constEnums'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'

const StyledRow = styled(Row)({
  alignItems: 'flex-start',
  border: 0,
  padding: 0
})

const DropdownAndError = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  width: '100%'
})

const Error = styled('div')({
  ...formError,
  textAlign: 'right'
})

const StyledButton = styled(SecondaryButton)({
  marginLeft: Layout.ROW_GUTTER,
  minWidth: '11rem',
  paddingLeft: 0,
  paddingRight: 0
})

const defaultSelectedChannel = () => ({
  channelId: undefined,
  channelName: 'Select a Slack channel'
})

interface Props extends WithAtmosphereProps, WithMutationProps {
  accessToken: string
  subbedChannels: ReadonlyArray<any>
  teamMemberId: string
}

interface State {
  isLoaded?: boolean
  options: any[]
  selectedChannel: {
    channelId: any
    channelName: string
  }
}

class AddSlackChannel extends Component<Props, State> {
  lastUpdated = 0

  state: State = {
    options: [],
    selectedChannel: defaultSelectedChannel()
  }

  componentWillReceiveProps (nextProps) {
    const {accessToken} = nextProps
    if (!this.props.accessToken !== accessToken) {
      // TODO: fix TS warning
      // this.fetchOptions(accessToken)
    }
  }

  updateDropdownItem = (option) => () => {
    this.setState({
      selectedChannel: {
        channelId: option.id,
        channelName: option.label
      },
      options: this.state.options.filter((row) => row.id !== option.id)
    })
  }

  handleAddChannel = () => {
    const {atmosphere, teamMemberId, onError, onCompleted} = this.props
    const {selectedChannel} = this.state
    if (!selectedChannel.channelId) return
    AddSlackChannelMutation(atmosphere, selectedChannel, teamMemberId, onError, onCompleted)
    this.setState({
      selectedChannel: defaultSelectedChannel()
    })
  }

  fetchOptions = async (accessToken) => {
    const now = Date.now()
    const isStale = now - this.lastUpdated > ms('30s')
    if (accessToken && isStale) {
      this.lastUpdated = now
      const uri = `https://slack.com/api/channels.list?token=${accessToken}&exclude_archived=1`
      const res = await window.fetch(uri)
      const resJson = await res.json()
      const {ok, channels, error} = resJson
      if (!ok) {
        throw new Error(error)
      }
      const {subbedChannels} = this.props
      const subbedChannelIds = subbedChannels.map((channel) => channel.channelId)
      const options = channels
        .filter((channel) => !subbedChannelIds.includes(channel.id))
        .map((channel) => ({id: channel.id, label: channel.name}))
      this.setState({
        isLoaded: true,
        options
      })
    }
  }

  render () {
    const {
      isLoaded,
      options,
      selectedChannel: {channelName}
    } = this.state
    const {accessToken, error} = this.props
    return (
      <StyledRow>
        <DropdownAndError>
          <ServiceDropdownInput
            fetchOptions={() => this.fetchOptions(accessToken)}
            dropdownText={channelName}
            handleItemClick={this.updateDropdownItem}
            options={options}
            isLoaded={isLoaded}
          />
          <Error>{error && (error as any).message}</Error>
        </DropdownAndError>
        <StyledButton onClick={this.handleAddChannel}>{'Add Channel'}</StyledButton>
      </StyledRow>
    )
  }
}

export default withAtmosphere(withMutationProps(AddSlackChannel))
