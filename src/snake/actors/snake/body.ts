import { DraftSource } from '../../../../teatre/dist/server/services/stage/sources/draft'

export class SnakeBody {
  private options: {
    headColor: string
    bodyColor: string
  } = {
    headColor: 'black',
    bodyColor: 'black',
  }
  
  private _cells: { x: number, y: number }[] = []

	constructor(private draft: DraftSource) {}

	get cells() {
		return this._cells
	}
  
	get head() {
		return this._cells[this._cells.length - 1]
	}

	get neck() {
		return this._cells[this._cells.length - 2]
	}

	has(x: number, y: number): boolean {
		for (const cell of this._cells) {
			if (cell.x === x && cell.y === y) return true
		}

		return false
	}

	add(x: number, y: number): void {
		this._cells.push({ x, y })
	}

	place(x: number, y: number): void {
		this._cells.shift()
		this._cells.push({ x, y })
	}

	draw(): void {
		const draft = this.draft

		draft.clearRect(0, 0, draft.width, draft.height)
		draft.save()

		const head = this._cells[this._cells.length - 1]

		draft.fillStyle = this.options.headColor
		draft.fillRect(head.x, head.y, 1, 1)

		draft.fillStyle = this.options.bodyColor

		for (let i = this._cells.length - 2; i >= 0; i--) {
			const cell = this._cells[i]

			draft.fillRect(cell.x, cell.y, 1, 1)
		}

		draft.restore()
	}
}
