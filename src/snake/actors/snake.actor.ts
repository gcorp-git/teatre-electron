import { Actor } from '../../../teatre/dist/server/decorators/actor.decorator'
import { ConfigService } from '../../../teatre/dist/server/services/config.service'
import { ScenariosService } from '../../../teatre/dist/server/services/scenarios.service'
import { StatsService } from '../services/stats.service'
import { SceneObject } from '../../../teatre/dist/server/services/stage/scene-object'
import { Sprite } from '../../../teatre/dist/server/services/stage/sprite'
import { DraftSource } from '../../../teatre/dist/server/services/stage/sources/draft'
import { MainScenario } from '../scenarios/main.scenario'
import { DefeatScenario } from '../scenarios/defeat.scenario'
import { SnakeBody } from './snake/body'
import { FoodActor } from './food.actor'
import { ring } from '../../../teatre/dist/utils/etc'

@Actor()
export class SnakeActor extends Actor.Class {
  private DEFAULT_BODY_CELL: { x: number, y: number }
  private scenario: MainScenario
  private body: SnakeBody
  private vx = 0
  private vy = 0
  
  private _isAlive = false

  constructor(
    private config: ConfigService,
    private scenarios: ScenariosService,
    private stats: StatsService,
  ) {
    super()

    this.DEFAULT_BODY_CELL = {
      x: this.config.stage.width / 2,
      y: this.config.stage.height / 2,
    }
    
    const width = this.config.stage.width
    const height = this.config.stage.height
    const draft = new DraftSource({ width, height })

    this.body = new SnakeBody(draft)
    this.object = new SceneObject({ x: 0, y: 0, z: 2, width, height, sprites: [new Sprite(draft)] })
  }

  get isAlive() {
    return this._isAlive
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
    
    this.stats.score = 1
  }

  onDisable(): void {
    this._isAlive = false
    
    this.vx = 0
    this.vy = 0
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

    const x = this.body.head.x + dx
    const y = this.body.head.y + dy

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
