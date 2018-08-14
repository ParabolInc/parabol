// @flow
/**
 *  Notes:
 * postion = s
 * velocity = v = f(s) =  ds/dt = sf-si/tf-ti
*/

interface Vector {
  x: number,
  y: number
}

class DragPhysics {
  static displacement({ x, y }: Vector): number {
    return y - x
  }

  static calculateVelocity(position: Vector, time: Vector) {
    const distanceTravelled = this.displacement(position)
    const timeSpent = this.displacement(time)
    return distanceTravelled/timeSpent
  }

  static updateCardPosition(mouse, card, update) {
    const xVelocity = mouse.x - card.x
    const { x, y } = mouse
    const updatedCardPosition = { x, y }
    const position = {
      top: `${y} px`,
      bottom: `${x-125} px`
    }
    return update({
      updatedCardPosition,
      position
    })
  }
}