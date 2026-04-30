<template>
  <div class="text-white">
    <div v-if="isPaymentMethodListFetching" class="flex flex-col gap-4">
      <PaymentMethodSkeleton />
    </div>
    <div v-else-if="paymentMethodListError">
      <p class="text-center text-red-500">{{ t('paymentMethods.errorLoadingPaymentMethods') }}</p>
    </div>
    <div v-else class="flex flex-col gap-4">
      <PaymentMethod
        v-for="paymentMethod in paymentMethodList"
        :key="paymentMethod.id"
        :paymentMethod="paymentMethod"
        :isOnlyOne="paymentMethodList?.length < 2"
        :disabled="isPaymentMethodDeleting || isPaymentMethodSettingDefault"
        :isSettingAsDefault="
          paymentMethod.id === selectedPaymentMethod?.id && isPaymentMethodSettingDefault
        "
        @setAsDefault="setAsDefault(paymentMethod)"
        @deletePaymentMethod="selectPaymentMethodToDelete(paymentMethod)"
      />
      <p v-if="!paymentMethodList?.length" class="text-black">
        {{ t('paymentMethods.noPaymentMethodsOnRecord') }}
      </p>
      <Button variant="default" @click="showAddDialog = true" class="stretch mx-auto mt-4 w-max">
        {{ t('paymentMethods.addPaymentMethod') }}
      </Button>
    </div>
    <Dialog :open="showAddDialog" @update:open="showAddDialog = false">
      <DialogContent class="max-h-[90dvh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle
            class="my-4 text-balance text-center font-Matter text-5xl font-light uppercase"
            >{{ t('paymentMethods.addPaymentMethodTitle') }}</DialogTitle
          >
          <DialogDescription
            class="text-balance text-center font-Matter text-base font-light lg:text-lg"
            >{{ t('paymentMethods.addPaymentMethodDescription') }}</DialogDescription
          >
        </DialogHeader>
        <StripePaymentMethodForm @success="onPaymentMethodAdded" @close="showAddDialog = false" />
      </DialogContent>
    </Dialog>

    <Dialog :open="showDeleteDialog" @update:open="clearSelectedPaymentMethod">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ t('paymentMethods.deletePaymentMethodTitle') }}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {{ t('paymentMethods.deletePaymentMethodConfirmation') }}
        </DialogDescription>
        <DialogFooter>
          <Button
            v-if="selectedPaymentMethod"
            :loading="isPaymentMethodDeleting"
            :disabled="isPaymentMethodDeleting"
            @click="deletePaymentMethod(selectedPaymentMethod.id)"
          >
            <Loader2
              v-if="isPaymentMethodDeleting"
              class="mr-2 h-4 w-4 animate-spin stroke-white"
            />
            {{ t('paymentMethods.delete') }}</Button
          >
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { watch, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useAccountStore } from '@/stores/account.store';
import { usePaymentMethodStore } from '@stores/paymentMethod.store';
import { useTranslation } from '@/locales/i18n';

import { Loader2 } from 'lucide-vue-next';
import PaymentMethod from '@modules/PaymentMethod/PaymentMethod.vue';
import PaymentMethodSkeleton from '@modules/PaymentMethod/PaymentMethodSkeleton.vue';
import Button from '@ui/button/Button.vue';
import StripePaymentMethodForm from '@modules/Forms/StripePaymentForm/StripePaymentMethodForm.vue';
import Dialog from '@ui/dialog/Dialog.vue';
import DialogContent from '@ui/dialog/DialogContent.vue';
import DialogHeader from '@ui/dialog/DialogHeader.vue';
import DialogTitle from '@ui/dialog/DialogTitle.vue';
import DialogFooter from '@ui/dialog/DialogFooter.vue';
import DialogDescription from '@ui/dialog/DialogDescription.vue';
import type { PaymentMethod as PaymentMethodType } from '@/api/paymentMethod.api';

const { t } = useTranslation();

const paymentMethodStore = usePaymentMethodStore();
const {
  paymentMethodList,
  isPaymentMethodListFetching,
  paymentMethodListError,
  isPaymentMethodDeleting,
  isPaymentMethodSettingDefault,
} = storeToRefs(paymentMethodStore);

const accountStore = useAccountStore();
const { isAuthenticated } = storeToRefs(accountStore);

const showAddDialog = ref(false);

function onPaymentMethodAdded() {
  showAddDialog.value = false;
  paymentMethodStore.fetchPaymentMethodList();
}

async function setAsDefault(paymentMethod: PaymentMethodType) {
  selectedPaymentMethod.value = paymentMethod;
  await paymentMethodStore.setDefaultPaymentMethod(paymentMethod.id);
  paymentMethodStore.fetchPaymentMethodList();
}

const showDeleteDialog = ref(false);
const selectedPaymentMethod = ref<PaymentMethodType | null>(null);

const selectPaymentMethodToDelete = (paymentMethod: PaymentMethodType) => {
  selectedPaymentMethod.value = paymentMethod;
  showDeleteDialog.value = true;
};

const clearSelectedPaymentMethod = () => {
  selectedPaymentMethod.value = null;
  showDeleteDialog.value = false;
};

async function deletePaymentMethod(id: string) {
  await paymentMethodStore.deletePaymentMethod(id);
  paymentMethodStore.fetchPaymentMethodList();
  clearSelectedPaymentMethod();
}

watch(
  isAuthenticated,
  (newValue) => {
    if (newValue) {
      paymentMethodStore.fetchPaymentMethodList();
    } else {
      paymentMethodStore.resetPaymentMethodList();
    }
  },
  { immediate: true },
);
</script>
