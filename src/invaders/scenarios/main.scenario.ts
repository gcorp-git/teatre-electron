import { Scenario } from '../../../teatre/dist/server/decorators/scenario.decorator'
import { ScenariosService } from '../../../teatre/dist/server/services/scenarios.service'
import { ConfigService } from '../../../teatre/dist/server/services/config.service'
import { EventsService, KEY } from '../../../teatre/dist/server/services/events.service'
import { SubscriptionsService } from '../services/subscriptions.service'
import { StatsService } from '../services/stats.service'
import { ShipActor } from '../actors/ship.actor'
import { EnemyActor } from '../actors/enemy.actor'
import { ShotActor } from '../actors/shot.actor'
import { MainScene } from '../scenes/main.scene'
import { DefeatScenario } from './defeat.scenario'

const ENEMIES_SPAWN_LEVEL = 5

@Scenario({
  scene: MainScene,
  actors: [ShipActor],
  extras: [EnemyActor, ShotActor],
})
export class MainScenario extends Scenario.Class {
  private duration = 0
  private interval = 0.100
  private isShootingKeyPressed = false

  constructor(
    private scenarios: ScenariosService,
    private config: ConfigService,
    private events: EventsService,
    private subscriptions: SubscriptionsService,
    private stats: StatsService,
  ) {
    super()
  }
  
  onEnable(): void {
    this.stats.score = 0
    this.duration = 0

    this.spawnEnemy()

    this.subscriptions.save(this.events.on(KEY.DOWN, ({ code }) => {
      let dx: number | undefined

      switch (code) {
        case 'KeyA':
        case 'ArrowLeft': { dx = -1 } break

        case 'KeyD':
        case 'ArrowRight': { dx = +1 } break

        case 'KeyS':
        case 'ArrowDown': { dx = 0 } break
      }

      if (['KeyW', 'ArrowUp', 'Space'].includes(code)) {
        this.isShootingKeyPressed = true
      }

      if (dx != undefined) this.actor(ShipActor).turn(dx)
    }))

    this.subscriptions.save(this.events.on(KEY.UP, ({ code }) => {
      if (['KeyW', 'ArrowUp', 'Space'].includes(code)) {
        this.isShootingKeyPressed = false
      }
    }))
  }

  onFrame(delta: number): void {
    this.duration += delta

    if (this.duration >= this.interval) {
      this.duration = 0
      
      this.tick()
    }
  }

  onDisable(): void {
    this.extras(EnemyActor).clear()
    this.extras(ShotActor).clear()
  }

  tick(): void {
    const ship = this.actor(ShipActor)

    if (this.isShootingKeyPressed) ship.shoot()

    if (!ship.isAlive) return this.defeat()

    const shots = this.extras(ShotActor)

    shots.each(shot => {
      shot.tick()

      if (!shot.isAlive) {
        shots.destroy(shot)
      }
    })

    ship.tick()

    const enemies = this.extras(EnemyActor)

    let enemiesTop = Infinity
    let enemiesBottom = -Infinity

    enemies.each(enemy => {
      enemy.tick()

      if (!enemy.isAlive) {
        enemies.destroy(enemy)
      } else {
        const top = enemy.object.y
        const bottom = enemy.object.y + enemy.object.height - 1
    
        if (top < enemiesTop) enemiesTop = top
        if (bottom > enemiesBottom) enemiesBottom = bottom
      }
    })

    if (enemiesTop >= ENEMIES_SPAWN_LEVEL) this.spawnEnemy()
    if (enemiesBottom >= this.config.stage.height - ship.object.height) return this.defeat()
  }

  spawnEnemy(): void {
    const enemies = this.extras(EnemyActor)
    const enemy = enemies.create(true)
  }

  shoot(x: number, y: number, down=false): void {
    const shots = this.extras(ShotActor)
    const shot = shots.create(true)

    shot.place(x, y, down)
  }

  defeat(): void {
    this.scenarios.push(DefeatScenario)
  }
}
