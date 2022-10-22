import { Actor } from '../../../teatre/dist/server/decorators/actor.decorator'
import { ConfigService } from '../../../teatre/dist/server/services/config.service'
import { SceneObject } from '../../../teatre/dist/server/services/stage/scene-object'
import { Sprite } from '../../../teatre/dist/server/services/stage/sprite'
import { MainScenario } from '../scenarios/main.scenario'
import { PixelBody } from '../utils/pixel-body'

const RECHARGE_TIME = 2
const HEALTH = 3
const PIXELS = [
  [0,0,1,0,0],
  [0,1,1,1,0],
  [1,1,1,1,1],
]

@Actor()
export class ShipActor extends Actor.Class {
  private scenario: MainScenario
  private body: PixelBody
  private vx = 0
  private health = 0
  private shotTicksAgo = 0
  
  private _isAlive = false

  constructor(private config: ConfigService) {
    super()

    this.body = new PixelBody(PIXELS)
    
    this.object = new SceneObject({
      x: 0,
      y: 0,
      z: 1,
      width: this.body.draft.width,
      height: this.body.draft.height,
      sprites: [new Sprite(this.body.draft)] },
    )
  }

  get isAlive() {
    return this._isAlive
  }

  onInit(scenario: MainScenario): void {
    this.scenario = scenario
  }

  onEnable(): void {
    this._isAlive = true

    this.vx = 0
    this.health = HEALTH
    this.shotTicksAgo = Infinity

    const x = Math.floor(this.config.stage.width / 2) - this.object.width
    const y = this.config.stage.height - this.object.height

    this.object.place(x, y)
  }

  onDisable(): void {
    this._isAlive = false
  }

  tick(): void {
    if (!this._isAlive) return

    if (!this.shotTicksAgo) {
      const x = this.object.x + Math.floor(this.object.width / 2)
      const y = this.object.y

      this.scenario.shoot(x, y, false)
    }
    
    this.shotTicksAgo++

    if (this.vx) {
      if (this.vx > 0) {
        if (this.object.x >= this.config.stage.width - this.object.width) this.vx = 0
      } else {
        if (this.object.x <= 0) this.vx = 0
      }

      this.object.move(this.vx)
    }
  }

  turn(vx: number): void {
    if (!this._isAlive) return

    this.vx = vx
  }

  shoot(): void {
    if (this.shotTicksAgo <= RECHARGE_TIME) return

    this.shotTicksAgo = 0
  }

  hurt(damage: number): void {
    if (damage < 0) damage = 0

    const delta = damage > this.health ? this.health : damage

    this.health -= delta

    if (this.health <= 0) this._isAlive = false
  }
}
