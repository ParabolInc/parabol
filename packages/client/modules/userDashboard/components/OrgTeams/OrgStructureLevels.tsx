import {DragDropContext, Draggable, Droppable, type DropResult} from '@hello-pangea/dnd'
import {useState} from 'react'
import {Add} from '~/ui/icons'
import {MAX_ORG_STRUCTURE_LEVELS} from '../../../../shared/reports/reportCatalog'
import OrgStructureLevelRow from './OrgStructureLevelRow'
import OrgStructureNameInput from './OrgStructureNameInput'
import {addLevel, moveLevel, type OrgStructureLevelData} from './orgStructureEdits'
import useOrgStructureEdits from './useOrgStructureEdits'

interface Props {
  orgId: string
  levels: readonly OrgStructureLevelData[]
}

const OrgStructureLevels = ({orgId, levels}: Props) => {
  const [onEdit, failedSaveCount] = useOrgStructureEdits(orgId, levels)
  const [isAddingLevel, setIsAddingLevel] = useState(false)
  const onDragEnd = ({source, destination, draggableId}: DropResult) => {
    if (!destination || destination.index === source.index) return
    onEdit(moveLevel(draggableId, destination.index))
  }
  return (
    <section className='overflow-hidden rounded-md border border-hairline bg-surface-card shadow-xs'>
      <div className='px-5 pt-4 pb-3'>
        <h2 className='m-0 font-semibold text-base'>Structure levels</h2>
        <p className='m-0 text-[13px] text-fg-secondary'>
          {levels.length === 0
            ? 'Add the levels your teams roll up to, widest first, like business unit, then department.'
            : 'Widest first. Drag to reorder.'}
        </p>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId='orgStructureLevels'>
          {(provided) => (
            <ol ref={provided.innerRef} {...provided.droppableProps} className='m-0 list-none p-0'>
              {levels.map((level, position) => (
                <Draggable key={level.id} draggableId={level.id} index={position}>
                  {(dragProvided) => (
                    <OrgStructureLevelRow
                      level={level}
                      position={position}
                      dragProvided={dragProvided}
                      failedSaveCount={failedSaveCount}
                      onEdit={onEdit}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ol>
          )}
        </Droppable>
      </DragDropContext>
      {levels.length < MAX_ORG_STRUCTURE_LEVELS && (
        <div className='border-hairline border-t px-5 py-2.5'>
          {isAddingLevel ? (
            <OrgStructureNameInput
              label='Name of the new level'
              placeholder='Level name, like Region'
              className='h-8 w-60 text-sm'
              onCommit={(name) => onEdit(addLevel(name))}
              onClose={() => setIsAddingLevel(false)}
            />
          ) : (
            <button
              type='button'
              onClick={() => setIsAddingLevel(true)}
              className='inline-flex h-8 cursor-pointer items-center gap-1 rounded-md border border-hairline-strong pr-2.5 pl-1.5 font-semibold text-[13px] text-fg-primary hover:bg-surface-hover'
            >
              <Add className='text-[18px]' />
              Add a level
            </button>
          )}
        </div>
      )}
    </section>
  )
}

export default OrgStructureLevels
