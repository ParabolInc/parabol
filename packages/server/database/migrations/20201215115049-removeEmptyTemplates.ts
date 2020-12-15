import {awaitExpression} from 'jscodeshift'
import {R} from 'rethinkdb-ts'
export const up = async function (r: R) {
  const now = new Date()
  try {
    const promptlessTemplates = await r
      .table('MeetingTemplate')
      .filter({type: 'retrospective'})
      .merge((template) => ({
        promptCount: r
          .table('ReflectPrompt')
          .getAll(template('id'), {index: 'templateId'})
          .count()
          .default(0)
      }))
      .filter((template) => template('promptCount').eq(0))
      .run()

    const promptlessTemplateIds = promptlessTemplates.map(({id}) => id)

    await r
      .table('MeetingTemplate')
      .getAll(r.args(promptlessTemplateIds))
      .filter({isActive: true})
      .update({isActive: false})
      .run()

    await r
      .table('NewMeeting')
      .getAll(promptlessTemplateIds, {index: 'templateId'})
      .filter((meeting) => meeting.hasFields('endedAt').not())
      .update({endedAt: now, removedAt: now})
      .run()

    // const test = await r
    //   .table('MeetingSettings')
    //   .filter({meetingType: 'retrospective'})
    //   .filter((settings) =>
    //     r
    //       .table('MeetingTemplate')
    //       .getAll(settings('selectedTemplateId'))
    //       .filter({isActive: false})
    //       .count()
    //       .ne(0)
    //   )
    //   .update({
    //     selectedTemplateId: r
    //       .table('MeetingTemplate')
    //       .filter({type: 'retrospective', isActive: true})
    //   })
    //   // .nth(0)('id')
    //   .default(null)
    //   .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function (r: R) {
  // noop
}
