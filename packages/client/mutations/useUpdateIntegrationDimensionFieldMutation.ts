import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useUpdateIntegrationDimensionFieldMutation as TUpdateIntegrationDimensionFieldMutation} from '../__generated__/useUpdateIntegrationDimensionFieldMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import createProxyRecord from '../utils/relay/createProxyRecord'

graphql`
  fragment useUpdateIntegrationDimensionFieldMutation_team on UpdateIntegrationDimensionFieldSuccess {
    meeting {
      phases {
        ... on EstimatePhase {
          stages {
            serviceField {
              name
              type
            }
          }
        }
      }
    }
  }
`

const mutation = graphql`
  mutation useUpdateIntegrationDimensionFieldMutation(
    $meetingId: ID!
    $taskId: ID!
    $dimensionName: String!
    $fieldId: String!
  ) {
    updateIntegrationDimensionField(
      meetingId: $meetingId
      taskId: $taskId
      dimensionName: $dimensionName
      fieldId: $fieldId
    ) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...useUpdateIntegrationDimensionFieldMutation_team @relay(mask: false)
    }
  }
`

type Handlers = {
  onSuccess?: () => void
  onError?: () => void
}

type Config = UseMutationConfig<TUpdateIntegrationDimensionFieldMutation> & {
  optimisticFieldName?: string
}

const useUpdateIntegrationDimensionFieldMutation = () => {
  const [commit, submitting] = useMutation<TUpdateIntegrationDimensionFieldMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = ({optimisticFieldName, ...config}: Config, handlers?: Handlers) => {
    const {meetingId, taskId, dimensionName, fieldId} = config.variables
    return commit({
      optimisticUpdater: (store) => {
        const meeting = store.get(meetingId)
        const phases = meeting?.getLinkedRecords('phases') ?? []
        const estimatePhase = phases.find((phase) => phase?.getValue('phaseType') === 'ESTIMATE')
        const stages = estimatePhase?.getLinkedRecords('stages') ?? []
        stages.forEach((stage) => {
          if (stage?.getLinkedRecord('task')?.getValue('id') !== taskId) return
          if (stage.getLinkedRecord('dimensionRef')?.getValue('name') !== dimensionName) return
          const nextServiceField = createProxyRecord(store, 'ServiceField', {
            name: optimisticFieldName ?? fieldId,
            type: 'string'
          })
          stage.setLinkedRecord(nextServiceField, 'serviceField')
        })
      },
      onCompleted: (res) => {
        const error = res.updateIntegrationDimensionField.error
        if (!error) {
          handlers?.onSuccess?.()
        } else {
          atmosphere.eventEmitter.emit('addSnackbar', {
            message: error.message,
            autoDismiss: 5,
            key: 'updateIntegrationDimensionFieldError'
          })
          handlers?.onError?.()
        }
      },
      ...config
    })
  }
  return [execute, submitting] as const
}

export default useUpdateIntegrationDimensionFieldMutation
