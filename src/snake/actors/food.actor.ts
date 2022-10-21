import { Actor } from '../../../teatre/dist/server/decorators/actor.decorator'
import { ConfigService } from '../../../teatre/dist/server/services/config.service'
import { SceneObject } from '../../../teatre/dist/server/services/stage/scene-object'
import { Sprite } from '../../../teatre/dist/server/services/stage/sprite'
import { DraftSource } from '../../../teatre/dist/server/services/stage/sources/draft'
import { MainScenario } from '../scenarios/main.scenario'

@Actor()
export class FoodActor extends Actor.Class {
  private scenario: MainScenario
  private color = 'gray'
  
  private _object: SceneObject

  constructor(private config: ConfigService) {
    super()

    const draft = new DraftSource({
      width: 1,
      height: 1,
    })

    this._object = new SceneObject({
      x: 0,
      y: 0,
      z: 1,
      width: 1,
      height: 1,
      sprites: [new Sprite(draft)],
    })

    this._draw(draft)
  }

  get object() {
    return this._object
  }

  onInit(scenario: MainScenario): void {
    this.scenario = scenario
  }

  onEnable(): void {
    this.replace()

    this.scene.add(this._object)
  }

  onDisable(): void {
    this.scene.remove(this._object)
  }

	at(x: number, y: number): boolean {
		return x === this._object.x && y === this._object.y
	}

  replace(): void {
		const snake = this.scenario.snake
		
		const cells = []

		for (let ix = 0; ix < this.config.stage.width; ix++) {
			for (let iy = 0; iy < this.config.stage.height; iy++) {
				if (snake.occupies(ix, iy)) continue

				cells.push({ x: ix, y: iy })
			}
		}

		const r = Math.floor(Math.random() * cells.length)

		this._object.x = cells[r].x
		this._object.y = cells[r].y
	}

	private _draw(draft): void {
		draft.clearRect(0, 0, draft.width, draft.height)
		draft.save()
		draft.fillStyle = this.color

		draft.fillRect(0, 0, 1, 1)

		draft.restore()
	}
}
