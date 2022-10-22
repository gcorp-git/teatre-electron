import { Actor } from '../../../teatre/dist/server/decorators/actor.decorator'
import { ConfigService } from '../../../teatre/dist/server/services/config.service'
import { StatsService } from '../services/stats.service'
import { SceneObject } from '../../../teatre/dist/server/services/stage/scene-object'
import { Sprite } from '../../../teatre/dist/server/services/stage/sprite'
import { MainScenario } from '../scenarios/main.scenario'
import { PixelBody } from '../utils/pixel-body'
import { ShipActor } from './ship.actor'
import { EnemyActor } from './enemy.actor'

const HEALTH = 1
const DAMAGE = 1
const PIXELS = [
  [1],
  [1],
]

@Actor()
export class ShotActor extends Actor.Class {
  private scenario: MainScenario
  private body: PixelBody
  private health = 0
  private damage = 0
  private counter = 0
  
  private _isAlive = false
  private _isMovingDown = false

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

    this.health = HEALTH
    this.damage = DAMAGE
    this.counter = 0
  }

  onDisable(): void {
    this._isAlive = false
  }

  place(x: number, y: number, isMovingDown=false): void {
    this._isMovingDown = isMovingDown

    x -= Math.floor(this.object.width / 2)
    y -= this._isMovingDown ? -1 : this.object.height

    this.object.place(x, y, 0)
  }

  tick(): void {
    if (!this._isAlive) return
    if (this._isMovingDown && ++this.counter % 2) return

    const vy = this._isMovingDown ? +1 : -1

    this.object.move(0, vy)

    const top = this.object.y
    const bottom = this.object.y + this.object.height
    const isOnScreen = (bottom > 0) && (top < this.config.stage.height)

    if (!isOnScreen) this._isAlive = false

    if (!this._isAlive) return

    this.scenario.extras(ShotActor).each(shot => {
      if (shot === this) return
      if (this.object.overlaps(shot.object)) {
        shot.hurt(this.damage)
        
        this._isAlive = false
      }
    })

    if (!this._isAlive) return

    if (this._isMovingDown) {
      const ship = this.scenario.actor(ShipActor)

      if (this.object.overlaps(ship.object)) {
        ship.hurt(this.damage)

        this._isAlive = false
      }
    } else {
      this.scenario.extras(EnemyActor).each(enemy => {
        if (this.object.overlaps(enemy.object)) {
          enemy.hurt(this.damage)

          this._isAlive = false
        }
      })
    }
  }

  hurt(damage: number): void {
    if (damage < 0) damage = 0

    const delta = damage > this.health ? this.health : damage

    this.health -= delta

    this.stats.score += delta

    if (this.health <= 0) this._isAlive = false
  }
}
