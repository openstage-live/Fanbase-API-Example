<template>
  <div v-if="isPasswordProtected">
    <div class="container flex h-dvh items-center justify-center">
      <PasswordProtectForm class="w-full max-w-lg" />
    </div>
  </div>
  <div v-else class="relative flex min-h-dvh flex-col" :class="pageBackgroundColor">
    <Header v-if="!route.meta.noHeader" :background="headerBackgroundColor" />
    <router-view />
    <Footer v-if="!route.meta.noFooter" class="mt-auto" />
    <NotForYou
      v-if="!route.meta.preview && isAuthenticated && emailMismatch"
      :isOpen="emailMismatch"
    />
    <MissingDetails
      v-else-if="!route.meta.preview && isAuthenticated && hasMissingFields"
      :isOpen="hasMissingFields"
    />
    <StripeRedirectDialog />
    <CommentsDialog
      v-model="commentStore.isCommentsDialogOpen"
      :comments="commentStore.comments || []"
      :post-id="commentStore.postId"
      :title="commentStore.contentTitle"
      :date="commentStore.contentReleaseDate"
    />
    <InviteDialog ref="inviteDialogRef" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, provide } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCookies } from '@vueuse/integrations/useCookies';
import { useFanStore } from '@stores/fan.store';
import { useAccountStore } from '@stores/account.store';
import { useCommentStore } from '@stores/comment.store';
import { storeToRefs } from 'pinia';
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core';
import { openInviteDialogKey, openCommentsDialogKey } from '@/utils/symbols';
import { useVisualViewportHeight } from '@composables/useVisualViewport';

import Footer from '@generics/Footer.vue';
import Header from '@modules/Header/Header.vue';
import PasswordProtectForm from '@modules/Forms/PasswordProtectForm.vue';
import MissingDetails from '@modules/Dialogs/MissingDetails.vue';
import NotForYou from '@modules/Dialogs/NotForYou.vue';
import StripeRedirectDialog from '@modules/Forms/StripePaymentForm/StripeRedirectDialog.vue';
import CommentsDialog from '@modules/Comment/CommentsDialog.vue';
import InviteDialog from '@modules/Dialogs/InviteDialog.vue';
import { env } from '@/env';

const route = useRoute();
const router = useRouter();
const cookies = useCookies(['stored-password']);
const fanStore = useFanStore();
const { hasMissingFields } = storeToRefs(fanStore);
const accountStore = useAccountStore();
const { isAuthenticated, friendIdInQuery } = storeToRefs(accountStore);
const commentStore = useCommentStore();
const breakpoints = useBreakpoints(breakpointsTailwind);

// NOTE: this is called once on created
accountStore.initializeAuthState();

const inviteDialogRef = ref<InstanceType<typeof InviteDialog>>();
const openInviteDialog = () => {
  inviteDialogRef.value?.open();
};
provide(openInviteDialogKey, openInviteDialog);

const openCommentsDialog = async (id: string, title: string, date: string) => {
  await commentStore.openCommentDialog(true, id, title, date);
};
provide(openCommentsDialogKey, openCommentsDialog);

// Keep CSS var --vvh synced with visual viewport height (iOS keyboard) — mobile only
const isMobile = breakpoints.smaller('lg');

const emailMismatch = computed(
  () =>
    accountStore.guestEmail && fanStore.fanEmail && accountStore.guestEmail !== fanStore.fanEmail,
);
const pageBackgroundColor = computed(() =>
  route.meta.bgColor === 'black' ? 'bg-black' : 'bg-white',
);
const headerBackgroundColor = computed(() =>
  route.meta.bgColor === 'black' ? 'bg-black' : 'bg-white',
);
const isPasswordProtected = computed(
  () => env.VITE_FF_PASSWORD && cookies.get('stored-password') !== env.VITE_FF_PASSWORD,
);

if (isMobile.value) {
  useVisualViewportHeight();
}

onMounted(async () => {
  await router.isReady();

  if (isPasswordProtected.value && cookies.get('stored-password')) {
    cookies.remove('stored-password');
  }

  if (friendIdInQuery.value && !isAuthenticated.value) {
    localStorage.setItem('friendId', friendIdInQuery.value);
    const { friendId: _, ...query } = route.query;
    router.replace({ query });
  }
});
</script>
