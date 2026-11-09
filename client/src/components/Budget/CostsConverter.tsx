import { ArrowRightLeft, RefreshCw } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { useCostsConverterPair } from '../Dashboard/useCostsConverterPair';
import { useCurrencyConverter } from '../Dashboard/useCurrencyConverter';
import CustomSelect from '../shared/CustomSelect';

const BODY_SIZE = 'calc(13px * var(--fs-scale-body, 1))';
const FIELD = 'min-w-0 max-w-[340px] flex-1 rounded-[12px] bg-surface-card p-3';
const AMOUNT =
  'w-full border-0 bg-transparent font-geist text-subtitle font-semibold tabular-nums text-content outline-none dark:bg-transparent';

/**
 * The dashboard's currency converter, opened from the Costs bar on the trip's
 * currency (Drevia fork). Its pair is the tab's own; the dashboard keeps its saved one.
 */
export default function CostsConverter({ tripCurrency }: { tripCurrency: string }) {
  const { t } = useTranslation();
  const pair = useCostsConverterPair(tripCurrency);
  const { from, to, setFrom, setTo, amount, setAmount, currencies, rate, converted, swap, fetchRates, ratePending } =
    useCurrencyConverter(pair);
  const options = currencies.map((c) => ({ value: c, label: c }));

  return (
    <div
      role="region"
      aria-label={t('costs.converter')}
      className="flex basis-full flex-wrap items-center gap-2.5 pe-1.5 pt-1"
      style={{ fontSize: BODY_SIZE }}
    >
      <div className={FIELD}>
        <div className="text-caption font-semibold uppercase tracking-[.08em] text-content-faint">
          {t('dashboard.fx.from')}
        </div>
        <input
          className={AMOUNT}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="decimal"
          aria-label={t('dashboard.fx.from')}
        />
        <CustomSelect
          ariaLabel={t('dashboard.fx.from')}
          value={from}
          onChange={(v) => setFrom(String(v))}
          options={options}
          searchable
          size="sm"
        />
      </div>
      <button
        type="button"
        onClick={swap}
        aria-label={t('dashboard.aria.swapCurrencies')}
        className="grid h-9 w-9 flex-none place-items-center rounded-full bg-accent text-accent-text"
      >
        <ArrowRightLeft size={14} />
      </button>
      <div className={FIELD}>
        <div className="text-caption font-semibold uppercase tracking-[.08em] text-content-faint">
          {t('dashboard.fx.to')}
        </div>
        <input
          className={AMOUNT}
          value={converted != null ? converted.toFixed(2) : '—'}
          readOnly
          aria-label={t('dashboard.fx.to')}
        />
        <CustomSelect
          ariaLabel={t('dashboard.fx.to')}
          value={to}
          onChange={(v) => setTo(String(v))}
          options={options}
          searchable
          size="sm"
        />
      </div>
      <div className="flex basis-full items-center gap-2 text-content-muted">
        <span className="font-geist tabular-nums">
          {ratePending ? '…' : rate != null ? `1 ${from} = ${rate.toFixed(4)} ${to}` : t('dashboard.fx.unavailable')}
        </span>
        <button
          type="button"
          onClick={fetchRates}
          aria-label={t('dashboard.aria.refreshRates')}
          className="text-content-faint hover:text-content"
        >
          <RefreshCw size={13} />
        </button>
      </div>
    </div>
  );
}
