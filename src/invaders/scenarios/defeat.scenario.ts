import { Scenario } from '../../../teatre/dist/server/decorators/scenario.decorator'
import { ScenariosService } from '../../../teatre/dist/server/services/scenarios.service';
import { StatsService } from '../services/stats.service';

@Scenario({
  actors: [],
})
export class DefeatScenario extends Scenario.Class {
  constructor(
    private scenarios: ScenariosService,
    private stats: StatsService,
  ) {
    super()
  }

  onEnable(): void {
    console.log(`YOU DIED. SCORE: ${this.stats.score}`);

    this.scenarios.pop();
  }
}
