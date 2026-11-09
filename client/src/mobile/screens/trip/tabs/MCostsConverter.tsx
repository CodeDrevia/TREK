import { ArrowRightLeft, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useCostsConverterPair } from '../../../../components/Dashboard/useCostsConverterPair';
import { useCurrencyConverter } from '../../../../components/Dashboard/useCurrencyConverter';
import { useTranslation } from '../../../../i18n';
import { MCurrencyConverterBody } from '../../dashboard/MDashWidgets';

/**
 * The dashboard's currency converter on the Costs tab, folded until asked for
 * and opened on the trip's currency (Drevia fork). The pair is the tab's own.
 */
export default function MCostsConverter({ tripCurrency }: { tripCurrency: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2 rounded-2xl border border-[color:var(--m-rowbr)] bg-m-card p-[13px]">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-[7px] text-start"
      >
        <ArrowRightLeft size={14} strokeWidth={2} className="flex-none text-m-faint" />
        <span className="min-w-0 text-body font-extrabold text-m-ink">{t('costs.converter')}</span>
        {open ? (
          <ChevronUp size={14} strokeWidth={2} className="ms-auto flex-none text-m-faint" />
        ) : (
          <ChevronDown size={14} strokeWidth={2} className="ms-auto flex-none text-m-faint" />
        )}
      </button>
      {open && <ConverterFields key={tripCurrency} tripCurrency={tripCurrency} />}
    </div>
  );
}

function ConverterFields({ tripCurrency }: { tripCurrency: string }) {
  const { t } = useTranslation();
  const conv = useCurrencyConverter(useCostsConverterPair(tripCurrency));
  return (
    <>
      <MCurrencyConverterBody
        conv={conv}
        rateAction={
          <button
            type="button"
            onClick={conv.fetchRates}
            aria-label={t('dashboard.aria.refreshRates')}
            className="flex text-m-faint"
          >
            <RefreshCw size={13} strokeWidth={2} />
          </button>
        }
      />
    </>
  );
}
