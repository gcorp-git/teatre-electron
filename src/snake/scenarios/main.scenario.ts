import { Scenario } from '../../../teatre/dist/server/decorators/scenario.decorator'
import { EventsService, KEY } from '../../../teatre/dist/server/services/events.service'
import { MainScene } from '../scenes/main.scene'
import { SnakeActor } from '../actors/snake.actor'
import { FoodActor } from '../actors/food.actor'
import { SubscriptionsService } from '../services/subscriptions.service'

@Scenario({
  scene: MainScene,
  actors: [SnakeActor, FoodActor],
})
export class MainScenario extends Scenario.Class {
  private duration = 0
  private interval = 0.100

  constructor(
    private events: EventsService,
    private subscriptions: SubscriptionsService,
  ) {
    super()
  }

  onEnable(): void {
    this.subscriptions.save(this.events.on(KEY.DOWN, ({ code }) => {
      let dx = 0
      let dy = 0

      switch (code) {
        case 'KeyA':
        case 'ArrowLeft': { dx = -1 } break

        case 'KeyD':
        case 'ArrowRight': { dx = +1 } break

        case 'KeyW':
        case 'ArrowUp': { dy = -1 } break
        
        case 'KeyS':
        case 'ArrowDown': { dy = +1 } break
      }

      this.actor(SnakeActor).turn(dx, dy)
    }))
  }

  onFrame(delta: number): void {
    this.duration += delta

		if (this.duration >= this.interval) {
			this.duration = 0

			this.actor(SnakeActor).tick()
		}
  }
}
