import { Actor } from '../../../teatre/dist/server/decorators/actor.decorator'
import { ConfigService } from '../../../teatre/dist/server/services/config.service'
import { SceneObject } from '../../../teatre/dist/server/services/stage/scene-object'
import { Sprite } from '../../../teatre/dist/server/services/stage/sprite'
import { DraftSource } from '../../../teatre/dist/server/services/stage/sources/draft'
import { MainScenario } from '../scenarios/main.scenario'
import { SnakeActor } from './snake.actor'

@Actor()
export class FoodActor extends Actor.Class {
  private scenario: MainScenario
  private color = 'gray'
  
  constructor(private config: ConfigService) {
    super()

    const width = 1
    const height = 1
    const draft = new DraftSource({ width: 1, height: 1 })

    this.object = new SceneObject({ x: 0, y: 0, z: 1, width, height, sprites: [new Sprite(draft)] })

    this._draw(draft)
  }

  onInit(scenario: MainScenario): void {
    this.scenario = scenario
  }

  onEnable(): void {
    this.replace()
  }

  onDisable(): void {
    //
  }

  at(x: number, y: number): boolean {
    return x === this.object.x && y === this.object.y
  }

  replace(): void {
    const snake = this.scenario.actor(SnakeActor)
    
    const cells = []

    for (let ix = 0; ix < this.config.stage.width; ix++) {
      for (let iy = 0; iy < this.config.stage.height; iy++) {
        if (snake.occupies(ix, iy)) continue

        cells.push({ x: ix, y: iy })
      }
    }

    const r = Math.floor(Math.random() * cells.length)

    this.object.x = cells[r].x
    this.object.y = cells[r].y
  }

  private _draw(draft): void {
    draft.clearRect(0, 0, draft.width, draft.height)
    draft.save()
    draft.fillStyle = this.color
    draft.fillRect(0, 0, 1, 1)
    draft.restore()
  }
}
