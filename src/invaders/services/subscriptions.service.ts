import { Meta, PROP } from '../../../teatre/dist/server/core/meta';
import { Service } from '../../../teatre/dist/server/decorators/service.decorator';
import { IMole } from '../../../teatre/dist/utils/mole.model';

@Service({
  static: false,
})
export class SubscriptionsService {
  private _saved: (() => void)[] = []

  constructor() {
    Meta.set(this, PROP.CONNECT, (dependant: IMole) => dependant.spy((method: string, ...args) => {
      if (method === 'destroy') this._saved.forEach(off => off())
    }))
  }

  save(off: () => void): void {
    this._saved.push(off)
  }
}
