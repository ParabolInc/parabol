import {r} from 'rethinkdb-ts'
import connectRethinkDB from '../../database/connectRethinkDB'

export async function up() {
  await connectRethinkDB()

  await r
    .table('ReflectPrompt')
    .filter({id: 'threatLevelPremortemTemplateSeverePrompt'})
    .update({groupColor: '#FD6157'})
    .run()
  await r
    .table('ReflectPrompt')
    .filter({id: 'threatLevelPremortemTemplateElevatedPrompt'})
    .update({groupColor: '#FFCC63'})
    .run()
  await r
    .table('ReflectPrompt')
    .filter({id: 'threatLevelPremortemTemplateLowPrompt'})
    .update({groupColor: '#66BC8C'})
    .run()
}

export async function down() {
  await connectRethinkDB()

  await r
    .table('ReflectPrompt')
    .filter({id: 'threatLevelPremortemTemplateSeverePrompt'})
    .update({groupColor: '#66BC8C'})
    .run()
  await r
    .table('ReflectPrompt')
    .filter({id: 'threatLevelPremortemTemplateElevatedPrompt'})
    .update({groupColor: '#FD6157'})
    .run()
  await r
    .table('ReflectPrompt')
    .filter({id: 'threatLevelPremortemTemplateLowPrompt'})
    .update({groupColor: '#FFCC63'})
    .run()
}
