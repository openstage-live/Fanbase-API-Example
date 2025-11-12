<template>
  <div>
    <RadioGroup v-if="!isSuccess" v-model="reason" :orientation="'vertical'">
      <div>
        <div class="flex w-full items-center justify-between">
          <span class="mb-2 text-lg font-bold dark:text-white">{{
            t('comments.reportComment')
          }}</span>
          <CircleX
            :size="18"
            @click="commentStore.setReportCommentForm(false)"
            class="cursor-pointer"
            stroke="white"
          />
        </div>
        <div class="mb-2 flex flex-col border-b border-t border-black/10 py-3 dark:border-white/10">
          <span class="mb-1 flex font-Matter-Bold text-xs dark:text-white">{{
            commentStore.reportToCommentName
          }}</span>
          <div
            class="comment-content text-xs dark:text-white"
            v-html="commentStore.reportToComment"
          ></div>
        </div>
      </div>
      <div
        v-for="reasonOption in reportReasons"
        :key="reasonOption.id"
        class="flex items-center space-x-2"
      >
        <RadioGroupItem :id="reasonOption.value" :value="reasonOption.value" />
        <Label :for="reasonOption.value">{{ t(reasonOption.label) }}</Label>
      </div>
      <div class="flex w-full flex-col justify-between gap-y-3">
        <Button :disabled="isReporting" class="mt-3 w-full" @click="reportComment">
          <Loader2 v-if="isReporting" class="mr-2 h-4 w-4 animate-spin stroke-white" />
          {{ t('comments.submitReport') }}</Button
        >
        <Button
          variant="link"
          size="sm"
          type="button"
          @click="commentStore.setReportCommentForm(false)"
          >{{ t('common.cancel') }}</Button
        >
      </div>
      <InfoBar
        class="mt-2"
        v-if="commentStore.commentReportError || error"
        variant="destructive"
        :title="commentStore.commentReportError || error"
      />
    </RadioGroup>
    <div v-else class="text-center">
      <h3 class="mb-1 text-lg font-bold dark:text-white">{{ t('comments.reportSuccessful') }}</h3>
      <p class="text-xs text-gray-600 dark:text-white">
        {{ t('comments.reportSuccessfulSubtitle') }}
      </p>
      <Button class="mt-4 w-full" @click="resetForm">{{ t('common.accept') }}</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCommentStore } from '@stores/comment.store';
import { useTranslation } from '@/locales/i18n';

// Components
import Button from '@ui/button/Button.vue';
import { Label } from '@ui/label';
import { RadioGroup, RadioGroupItem } from '@ui/radio-group';
import InfoBar from '@generics/InfoBar.vue';
import { env } from '@/env';

// Icons
import { CircleX, Loader2 } from 'lucide-vue-next';

// Composables
const { t } = useTranslation();

// Stores
const commentStore = useCommentStore();

// Refs
const reason = ref(null);
const error = ref('');
const isSuccess = ref(false);
const reportReasons = ref([
  {
    id: 1,
    label: 'comments.reportReasons.spam' as const,
    value: 'spam',
  },
  {
    id: 2,
    label: 'comments.reportReasons.bullying' as const,
    value: 'bullying',
  },
  {
    id: 3,
    label: 'comments.reportReasons.violence' as const,
    value: 'violence',
  },
  {
    id: 4,
    label: 'comments.reportReasons.sexual' as const,
    value: 'sexual',
  },
  {
    id: 5,
    label: 'comments.reportReasons.selfharm' as const,
    value: 'selfharm',
  },
]);

// Computed
const isReporting = computed(() => commentStore.commentReportisFetching);
const reportData = computed(() => commentStore.commentReportData);

// Methods
const reportComment = async () => {
  if (reason.value) {
    const postUrl = `${env.VITE_HOME_URL}/post/${commentStore.postId}`;
    const reasonLabel = t(
      reportReasons.value.find((r) => r.value === reason.value)?.label || reason.value,
    );
    await commentStore.reportComment(commentStore.reportToId, reasonLabel, postUrl);

    if (reportData.value) {
      reason.value = null;
      isSuccess.value = true;
      if (error.value) error.value = '';
    }
  } else {
    error.value = t('comments.reasonRequired');
  }
};

const resetForm = async () => {
  isSuccess.value = false;
  commentStore.clearSelectedCommentData();
};
</script>
