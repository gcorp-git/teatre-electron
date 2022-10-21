import { Play } from '../../teatre/dist/server/decorators/play.decorator'
import { MainScenario } from './scenarios/main.scenario'

@Play({
  title: 'Snake Play',
  stage: {
    width: 24,
    height: 24,
    scale: 16,
    smoothing: false,
  },
  assets: {
    images: [],
  },
})
export class SnakePlay extends Play.Class {
  onInit(): void {
    this.scenarios.push(MainScenario)
  }
}
