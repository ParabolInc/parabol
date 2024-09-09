import {GraphQLInterfaceType} from 'graphql'

// scaffolding until all types using this are migrated to codegen
const NewMeeting: GraphQLInterfaceType = new GraphQLInterfaceType({
  name: 'NewMeeting',
  fields: {}
})

export default NewMeeting
