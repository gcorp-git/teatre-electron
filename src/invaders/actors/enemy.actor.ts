import { Actor } from '../../../teatre/dist/server/decorators/actor.decorator'
import { ConfigService } from '../../../teatre/dist/server/services/config.service'
import { StatsService } from '../services/stats.service'
import { SceneObject } from '../../../teatre/dist/server/services/stage/scene-object'
import { Sprite } from '../../../teatre/dist/server/services/stage/sprite'
import { MainScenario } from '../scenarios/main.scenario'
import { PixelBody } from '../utils/pixel-body'

const RECHARGE_TIME = 24
const HEALTH = 1
const PIXELS = [
  [1,0,1,1,1,0,1],
  [0,1,0,1,0,1,0],
  [0,0,1,1,1,0,0],
]

@Actor()
export class EnemyActor extends Actor.Class {
  private scenario: MainScenario
  private body: PixelBody
  private vx = 0
  private health = 0
  private shotTicksAgo = 0
  
  private _isAlive = false

  constructor(
    private config: ConfigService,
    private stats: StatsService,
  ) {
    super()

    this.body = new PixelBody(PIXELS)
    
    this.object = new SceneObject({
      x: 0,
      y: 0,
      z: 0,
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

    this.vx = Math.random() < 0.5 ? -1 : +1
    this.health = HEALTH
    this.shotTicksAgo = rand(RECHARGE_TIME) + 1

    const x = rand(this.config.stage.width - this.object.width)
    const y = 0

    this.object.place(x, y)
  }

  onDisable(): void {
    this._isAlive = false
  }

  tick(): void {
    if (!this._isAlive) return

    let moveLower = false

    if (this.vx > 0) {
      if (this.object.x >= this.config.stage.width - this.object.width) moveLower = true
    } else {
      if (this.object.x <= 0) moveLower = true
    }

    if (moveLower) this.vx *= -1

    const vx = moveLower ? 0 : this.vx
    const vy = moveLower ? +1 : 0

    this.object.move(vx, vy)

    this.shoot()

    if (!this.shotTicksAgo) {
      const x = this.object.x + Math.floor(this.object.width / 2)
      const y = this.object.y

      this.scenario.shoot(x, y, true)
    }
    
    this.shotTicksAgo++
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

    this.stats.score += delta

    if (this.health <= 0) this._isAlive = false
  }
}

function rand(n: number): number {
  return Math.floor(Math.random() * n)
}
