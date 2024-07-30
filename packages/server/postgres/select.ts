import {NotNull, sql} from 'kysely'
import getKysely from './getKysely'

export const selectTimelineEvent = () => {
  return getKysely().selectFrom('TimelineEvent').selectAll().$narrowType<
    | {
        type: 'actionComplete' | 'POKER_COMPLETE' | 'TEAM_PROMPT_COMPLETE' | 'retroComplete'
        teamId: NotNull
        orgId: NotNull
        meetingId: NotNull
      }
    | {type: 'createdTeam'; teamId: NotNull; orgId: NotNull}
  >()
}
export const selectTemplateScale = () => {
  return getKysely()
    .selectFrom('TemplateScale')
    .where('removedAt', 'is', null)
    .leftJoin('TemplateScaleValue', 'TemplateScale.id', 'TemplateScaleValue.templateScaleId')
    .groupBy('TemplateScale.id')
    .selectAll('TemplateScale')
    .select(() => [
      sql<
        {color: string; label: string; sortOrder: string}[]
      >`json_agg(json_build_object('color', "TemplateScaleValue".color, 'label', "TemplateScaleValue".label, 'sortOrder', "TemplateScaleValue"."sortOrder") ORDER BY "TemplateScaleValue"."sortOrder")`.as(
        'values'
      )
    ])
}

export const selectTemplateDimension = () => {
  return getKysely().selectFrom('TemplateDimension').selectAll().where('removedAt', 'is', null)
}
