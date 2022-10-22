import { Actor } from '../../../teatre/dist/server/decorators/actor.decorator'
import { ConfigService } from '../../../teatre/dist/server/services/config.service'
import { ScenariosService } from '../../../teatre/dist/server/services/scenarios.service'
import { StatsService } from '../services/stats.service'
import { SceneObject } from '../../../teatre/dist/server/services/stage/scene-object'
import { Sprite } from '../../../teatre/dist/server/services/stage/sprite'
import { DraftSource } from '../../../teatre/dist/server/services/stage/sources/draft'
import { SnakeBody } from './snake/body'
import { ring } from '../../../teatre/dist/utils/etc'
import { FoodActor } from './food.actor'
import { MainScenario } from '../scenarios/main.scenario'
import { DefeatScenario } from '../scenarios/defeat.scenario'

@Actor()
export class SnakeActor extends Actor.Class {
  private scenario: MainScenario
  private DEFAULT_BODY_CELL: { x: number, y: number } = { x: 0, y: 0 }
  private body: SnakeBody
  private vx = 0
  private vy = 0
  
  private _isAlive = false
  private _object: SceneObject

  constructor(
    private config: ConfigService,
    private scenarios: ScenariosService,
    private stats: StatsService,
  ) {
    super()

    this.DEFAULT_BODY_CELL.x = this.config.stage.width / 2
    this.DEFAULT_BODY_CELL.y = this.config.stage.height / 2
    
    const draft = new DraftSource({
      width: this.config.stage.width,
      height: this.config.stage.height,
    })

    this.body = new SnakeBody(draft)

    this._object = new SceneObject({
      x: 0,
      y: 0,
      z: 2,
      width: this.config.stage.width,
      height: this.config.stage.height,
      sprites: [new Sprite(draft)],
    })
  }

  get isAlive() {
    return this._isAlive
  }

  get object() {
    return this._object
  }

  onInit(scenario: MainScenario): void {
    this.scenario = scenario
  }

  onEnable(): void {
    this._isAlive = true

    this.body.cells[0] = this.body.cells.length
			? this.body.head
			: this.DEFAULT_BODY_CELL
		
		this.body.cells.length = 1

    this.scenario.scene.add(this._object)
  }

  onDisable(): void {
    this._isAlive = false
    
    this.vx = 0
    this.vy = 0

    this.scenario.scene.remove(this._object)
  }

  tick(): void {
    if (!this._isAlive) return

		const food = this.scenario.actor(FoodActor)
		const { x, y } = this._getNextCoords()

		if (food.at(x, y)) {
			this.eat(food)
			food.replace()
		} else {
			this.place(x, y)
		}

    if (!this._isAlive) this.scenarios.push(DefeatScenario)
  }

  turn(dx: number, dy: number): void {
    if (!this._isAlive) return

		let x = this.body.head.x + dx
		let y = this.body.head.y + dy

		if (this.body.neck && x === this.body.neck.x && y === this.body.neck.y) return

		this.vx = dx
		this.vy = dy
  }

	place(x: number, y: number): void {
		if (!this._isAlive) return

		if (x !== this.body.head.x || y !== this.body.head.y) {
			if (this.body.has(x, y)) this._isAlive = false

			this.body.place(x, y)
		}

		this.body.draw()
	}

	occupies(x: number, y: number): boolean {
		return this.body.has(x, y)
	}

  eat(food: FoodActor): void {
    if (!this._isAlive) return

		this.body.add(food.object.x, food.object.y)
		this.body.draw()

    this.stats.score += 1
  }

  private _getNextCoords(): { x: number, y: number } {
    return {
      x: ring(0, this.body.head.x + this.vx, this.config.stage.width),
      y: ring(0, this.body.head.y + this.vy, this.config.stage.height),
    }
  }
}
