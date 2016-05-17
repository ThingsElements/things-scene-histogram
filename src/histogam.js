var { Component, Rect } = scene

export default class Histogam extends Rect {

  _draw(context) {
    var {
      value = 0,
      hidden = false,
      fillStyle,
      blankStrokeStyle,
      top,
      left,
      width,
      height
    } = this.model;

    if(!hidden){

      context.translate(left, top)

      context.beginPath()
      context.lineJoin = "miter"

      context.moveTo(width / 2, height)
      context.bezierCurveTo(width / 2, height * 3 / 4, 0, height / 2, 0, height / 4)
      
      context.ellipse(width / 2, height / 4, width / 2, height / 4, 0, Math.PI * 1, Math.PI * 0)
      
      context.bezierCurveTo(width, height / 2, width / 2, height * 3 / 4 , width / 2, height)

      // context.lineTo(width / 2, height)

      // context.quadraticCurveTo(width / 2, height * 3 / 4, width / 2, height)

      // context.quadraticCurveTo(width / 2, height * 4 / 3, 0, height / 4)

      context.closePath()

      this.drawFill(context)
      this.drawStroke(context)
      
      context.translate(-left, -top)
    }
  }
  get controls() {}
}

Component.register('Histogam', histogam)
