import { Scenario } from '../../../teatre/dist/server/decorators/scenario.decorator'
import { ScenariosService } from '../../../teatre/dist/server/services/scenarios.service';
import { StatsService } from '../services/stats.service';

@Scenario({
  actors: [],
})
export class DefeatScenario extends Scenario.Class {
  private data: any

  constructor(
    private scenarios: ScenariosService,
    private stats: StatsService,
  ) {
    super()
  }

  onEnable(data: any): void {
    this.data = data

    alert(`YOU DIED\nSNAKE SIZE: ${this.stats.score}`);

		this.scenarios.pop();
  }
}
