<template>
  <Dialog :open="isOpen">
    <DialogContent class="max-h-screen overflow-scroll sm:max-w-[500px]" hideClose>
      <DialogHeader>
        <DialogTitle class="mb-2">{{ t('notForYou.title') }}</DialogTitle>
        <DialogDescription>{{
          t('notForYou.description', { emailIntendedFor, emailCurrentUser })
        }}</DialogDescription>
      </DialogHeader>
      <Button @click="switchAccount">
        {{ t('notForYou.switch', { emailIntendedFor }) }}
      </Button>
      <a
        class="link cursor-pointer self-center text-center underline underline-offset-2"
        @click="stay"
      >
        {{ t('notForYou.stay', { emailCurrentUser }) }}
      </a>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { useTranslation } from '@/locales/i18n';
import { Button } from '@ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@ui/dialog';
import { useAccountStore } from '@stores/account.store';
import { useFanStore } from '@stores/fan.store';
import { storeToRefs } from 'pinia';

defineProps<{
  isOpen: boolean;
}>();

const accountStore = useAccountStore();
const fanStore = useFanStore();
const { t } = useTranslation();
const { guestEmail: emailIntendedFor } = storeToRefs(accountStore);
const { fanEmail: emailCurrentUser } = storeToRefs(fanStore);

const switchAccount = () => accountStore.logoutFan('Login');
const stay = () => (emailIntendedFor.value = emailCurrentUser.value);
</script>
