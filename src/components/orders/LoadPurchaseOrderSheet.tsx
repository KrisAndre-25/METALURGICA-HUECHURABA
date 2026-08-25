import type { SalesRequest } from '../../types/order';
import { BottomSheet } from '../ui/BottomSheet';
import { useUiPrefs } from '../../contexts/UiPrefsContext';
import { formatUF } from '../../utils/formatters';
import { OrderSpecsForm } from './OrderSpecsForm';

export function LoadPurchaseOrderSheet({ request, onClose }: { request: SalesRequest | null; onClose: () => void }) {
  const { t, language } = useUiPrefs();

  return (
    <BottomSheet
      open={request !== null}
      onClose={onClose}
      title={t.orders.specsForm.titleLoad}
      subtitle={request ? `${request.clientName} · ${request.projectName} · ${formatUF(request.estimatedAmountUF, language)}` : undefined}
    >
      {request && <OrderSpecsForm request={request} onDone={onClose} />}
    </BottomSheet>
  );
}
