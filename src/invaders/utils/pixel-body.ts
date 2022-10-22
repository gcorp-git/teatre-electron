import { DraftSource } from '../../../teatre/dist/server/services/stage/sources/draft'

export class PixelBody {
  private pixels: number[][]
  private color = 'black'

  private _draft: DraftSource

  constructor(pixels: number[][], color='black') {
    this.pixels = pixels

    const width = pixels[0].length
    const height = pixels.length

    this._draft = new DraftSource({ width, height })

    this._draw()
  }

  get width() {
    return this._draft.width
  }
  
  get height() {
    return this._draft.height
  }
  
  get draft() {
    return this._draft
  }

  private _draw(): void {
    const draft = this._draft

    draft.clearRect(0, 0, draft.width, draft.height)
    draft.save()

    draft.fillStyle = this.color

    for (let iy = 0, lenY = this.pixels.length; iy < lenY; iy++) {
      for (let ix = 0, lenX = this.pixels[iy].length; ix < lenX; ix++) {
        if (this.pixels[iy][ix]) draft.fillRect(ix, iy, 1, 1)
      }
    }

    draft.restore()
  }
}
