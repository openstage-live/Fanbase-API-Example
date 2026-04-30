import { ApiOk } from '@/api/api.service';
import { computed } from 'vue';
import { defineStore } from 'pinia';
import { useApiFetcher } from '@/composables/useApiFetcher';
import {
  createSetupIntent,
  deletePaymentMethod as deletePaymentMethodApi,
  getPaymentMethodList,
  PaymentMethodList,
  PaymentMethodSetupIntent,
  updatePaymentMethod,
} from '@api/paymentMethod.api';

export const usePaymentMethodStore = defineStore('paymentMethod', () => {
  const { data: createSetupIntentData, execute: executeCreateSetupIntent } =
    useApiFetcher<PaymentMethodSetupIntent | null>(null);

  const {
    data: paymentMethodList,
    error: paymentMethodListError,
    isFetching: isPaymentMethodListFetching,
    execute: executePaymentMethodList,
    reset: resetPaymentMethodList,
  } = useApiFetcher<PaymentMethodList>([]);

  const {
    data: paymentMethodSetDefaultResponse,
    error: paymentMethodSetDefaultError,
    isFetching: isPaymentMethodSettingDefault,
    execute: executeUpdatePaymentMethod,
  } = useApiFetcher<PaymentMethodList>([]);

  const {
    data: paymentMehodDeleteResponse,
    error: paymentMethodDeleteError,
    isFetching: isPaymentMethodDeleting,
    execute: executeDeletePaymentMethod,
  } = useApiFetcher<ApiOk | null>(null);

  const createPaymentMethod = () => executeCreateSetupIntent((signal) => createSetupIntent(signal));

  const paymentMethodClientSecret = computed(
    () => createSetupIntentData.value?.clientSecret || null,
  );

  const fetchPaymentMethodList = async () => {
    await executePaymentMethodList((signal) => getPaymentMethodList(signal));
  };

  const setDefaultPaymentMethod = async (paymentMethodId: string) => {
    await executeUpdatePaymentMethod((signal) => updatePaymentMethod(paymentMethodId, signal));
  };

  const deletePaymentMethod = async (paymentMethodId: string) => {
    await executeDeletePaymentMethod((signal) => deletePaymentMethodApi(paymentMethodId, signal));
  };

  return {
    paymentMethodList,
    paymentMethodListError,
    isPaymentMethodListFetching,
    fetchPaymentMethodList,
    resetPaymentMethodList,
    createPaymentMethod,
    paymentMethodClientSecret,
    paymentMethodSetDefaultResponse,
    isPaymentMethodSettingDefault,
    paymentMethodSetDefaultError,
    setDefaultPaymentMethod,
    paymentMehodDeleteResponse,
    isPaymentMethodDeleting,
    paymentMethodDeleteError,
    deletePaymentMethod,
  };
});
