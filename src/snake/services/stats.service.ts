import { Service } from '../../../teatre/dist/server/decorators/service.decorator'

@Service({
  static: true,
})
export class StatsService {
  score: number = 0
}
