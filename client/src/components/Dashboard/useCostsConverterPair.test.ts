// FE-COMP-FXPAIR-DRV: the pair the Costs tab's converter opens on (Drevia fork).
import { costsConverterPair } from './useCostsConverterPair';

describe('costsConverterPair', () => {
  it('FE-COMP-FXPAIR-DRV-001: converts from the trip currency into the dashboard pair', () => {
    expect(costsConverterPair('JPY', 'EUR', 'USD')).toEqual({ from: 'JPY', to: 'EUR' });
  });

  it('FE-COMP-FXPAIR-DRV-002: skips the half of the pair that is the trip currency', () => {
    expect(costsConverterPair('EUR', 'EUR', 'CHF')).toEqual({ from: 'EUR', to: 'CHF' });
  });

  it('FE-COMP-FXPAIR-DRV-003: falls back to EUR, then USD, without a saved pair', () => {
    expect(costsConverterPair('GBP')).toEqual({ from: 'GBP', to: 'EUR' });
    expect(costsConverterPair('EUR')).toEqual({ from: 'EUR', to: 'USD' });
    expect(costsConverterPair('')).toEqual({ from: 'EUR', to: 'USD' });
  });
});
