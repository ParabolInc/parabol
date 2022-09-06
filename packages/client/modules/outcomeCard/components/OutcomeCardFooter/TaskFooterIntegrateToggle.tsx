import React from 'react'
import {useTranslation} from 'react-i18next'
import useTooltip from '~/hooks/useTooltip'
import CardButton from '../../../../components/CardButton'
import IconLabel from '../../../../components/IconLabel'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import {MenuMutationProps} from '../../../../hooks/useMutationProps'
import {UseTaskChild} from '../../../../hooks/useTaskChildFocus'
import lazyPreload from '../../../../utils/lazyPreload'

const TaskFooterIntegrateMenuRoot = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'TaskFooterIntegrateMenuRoot' */ '../../../../components/TaskFooterIntegrateMenuRoot'
    )
)

interface Props {
  mutationProps: MenuMutationProps
  task: any
  useTaskChild: UseTaskChild
  dataCy: string
}

const TaskFooterIntegrateToggle = (props: Props) => {
  const {mutationProps, task, useTaskChild, dataCy} = props

  const {t} = useTranslation()

  const {togglePortal, originRef, menuPortal, menuProps, loadingWidth, loadingDelay} = useMenu(
    MenuPosition.UPPER_RIGHT,
    {
      loadingWidth: 200
    }
  )
  const {
    tooltipPortal,
    openTooltip,
    closeTooltip,
    originRef: tipRef
  } = useTooltip<HTMLDivElement>(MenuPosition.UPPER_CENTER)
  return (
    <>
      <CardButton
        onClick={togglePortal}
        ref={originRef}
        onMouseEnter={TaskFooterIntegrateMenuRoot.preload}
        dataCy={`${dataCy}-button`}
      >
        <IconLabel
          icon='publish'
          onMouseEnter={openTooltip}
          onMouseLeave={closeTooltip}
          onClick={closeTooltip}
          ref={tipRef}
        />
      </CardButton>
      {tooltipPortal(<div>{t('TaskFooterIntegrateToggle.PushToIntegration')}</div>)}
      {menuPortal(
        <TaskFooterIntegrateMenuRoot
          menuProps={menuProps}
          loadingDelay={loadingDelay}
          loadingWidth={loadingWidth}
          mutationProps={mutationProps}
          task={task}
          useTaskChild={useTaskChild}
        />
      )}
    </>
  )
}

export default TaskFooterIntegrateToggle
