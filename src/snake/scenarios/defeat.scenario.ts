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
    // todo: alert is not defined (because it's node)
    // alert(`YOU DIED\nSNAKE SIZE: ${this.stats.score}`);
    console.log(`YOU DIED. SNAKE SIZE: ${this.stats.score}`);

		this.scenarios.pop();
  }
}
