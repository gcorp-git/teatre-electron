import { Service } from '../../../teatre/dist/server/decorators/service.decorator'

@Service()
export class StatsService {
  score: number = 0
}
