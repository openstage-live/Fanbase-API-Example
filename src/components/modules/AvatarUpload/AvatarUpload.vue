<template>
  <div class="flex flex-col items-center justify-center">
    <Avatar class="avatar-image-wrapper" size="lg">
      <div class="avatar-image">
        <div
          v-if="isLoading"
          class="h-full w-full animate-pulse rounded-full"
          style="width: 64px; height: 64px"
        />
        <div v-else>
          <AvatarImage :src="avatarUrl || avatarPlaceholder" :alt="t('avatar.profileAvatarAlt')" />
        </div>
      </div>
    </Avatar>
    <div v-if="cloudinaryLoadError" class="z-10 flex gap-x-2">
      <Button
        type="button"
        variant="input"
        size="sm"
        class="mt-[-1rem] rounded-full px-2 text-black dark:text-white"
        @click="loadCloudinary"
      >
        <RefreshCw class="stroke-red-500" />
      </Button>
    </div>
    <div v-else class="z-10 flex gap-x-10" :class="avatarUrl ? '' : 'translate-y-[-3rem]'">
      <Button
        v-if="avatarUrl"
        type="button"
        variant="input"
        size="sm"
        class="mt-[-2rem] rounded-full bg-black px-2 text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
        :class="avatarUrl ? 'border-background' : 'border-none'"
        :disabled="isFanPatchFetching || isSubmitting || isLoading"
        @click="showDeleteDialog = true"
      >
        <Trash class="stroke-white dark:stroke-black" />
      </Button>
      <Button
        type="button"
        variant="input"
        size="sm"
        class="mt-[-2rem] rounded-full bg-black px-2 text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
        :class="avatarUrl ? 'border-background' : 'border-none'"
        :disabled="isFanPatchFetching || isSubmitting || isLoading"
        @click="onOpenUploadWidget"
      >
        <Upload class="!h-5 !w-5 stroke-white" />
      </Button>
    </div>

    <Dialog :open="showDeleteDialog" @update:open="showDeleteDialog = false">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ t('avatar.deleteTitle') }}</DialogTitle>
        </DialogHeader>
        <DialogDescription>{{ t('avatar.deleteConfirmation') }}</DialogDescription>
        <DialogFooter>
          <Button
            :loading="isFanPatchFetching"
            :disabled="isFanPatchFetching"
            @click="onDeleteAvatar"
          >
            <Loader2 v-if="isFanPatchFetching" class="mr-2 h-4 w-4 animate-spin stroke-white" />
            {{ t('avatar.delete') }}</Button
          >
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { Trash, Loader2, RefreshCw, Upload } from 'lucide-vue-next';
import Avatar from '@ui/avatar/Avatar.vue';
import AvatarImage from '@ui/avatar/AvatarImage.vue';
import Button from '@ui/button/Button.vue';
import { useFanStore } from '@/stores/fan.store';
import { storeToRefs } from 'pinia';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@ui/dialog';
import { useTranslation } from '@/locales/i18n';

const { t } = useTranslation();

const avatarPlaceholder = '';

withDefaults(
  defineProps<{
    isSubmitting?: boolean;
    isLoading?: boolean;
  }>(),
  {},
);

const fanStore = useFanStore();
const { fanAvatarUrl, isFanPatchFetching } = storeToRefs(fanStore);
const avatarUrl = ref<typeof fanAvatarUrl.value | null>(fanAvatarUrl.value);
watch(fanAvatarUrl, (newVal) => (avatarUrl.value = newVal));

const showDeleteDialog = ref(false);

const cloudinaryLoaded = ref(false);
const cloudinaryLoadError = ref(false);

function loadScript(src: string) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

let myWidget: CloudinaryUploadWidget | undefined;

const onDeleteAvatar = async () => {
  avatarUrl.value = null;
  await saveAvatar();
  showDeleteDialog.value = false;
};

const saveAvatar = async () => await fanStore.fanPatchAvatar({ avatarUrl: avatarUrl.value });

const onOpenUploadWidget = () => {
  myWidget?.open();
};

const uploadWidgetStyles = computed(() => ({
  palette: {
    window: 'rgb(26, 26, 26)',
    windowBorder: 'rgba(255, 255, 255, 0.4)',
    tabIcon: 'rgb(255, 255, 255)',
    menuIcons: 'rgba(255, 255, 255, 0.8)',
    textDark: '#000000',
    textLight: '#FFFFFF',
    link: 'rgb(93, 217, 249)',
    action: 'rgb(0, 149, 187)',
    inactiveTabIcon: 'rgba(255, 255, 255, 0.8)',
    error: 'rgb(191, 63, 57)',
    inProgress: 'rgb(93, 217, 249)',
    complete: 'rgb(153, 230, 90)',
    sourceBg: 'rgb(15, 15, 15)',
  },
  frame: {
    background: 'rgb(0, 0, 0, 0.6)',
  },
  fonts: {
    "'Roboto', sans-serif":
      'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap',
  },
}));

watch(cloudinaryLoaded, (newVal) => {
  if (newVal) {
    myWidget = cloudinary.createUploadWidget(
      {
        cloudName: 'dimyv3wy5',
        folder: 'fanzone-example',
        cropping: true,
        croppingAspectRatio: 1,
        showSkipCropButton: false,
        clientAllowedFormats: ['webp', 'gif', 'jpg', 'jpeg', 'png'],
        showPoweredBy: false,
        uploadPreset: 'upload_image',
        styles: uploadWidgetStyles.value,
        sources: ['local'],
      },
      (error, result) => {
        if (!error && result && result.event === 'success') {
          avatarUrl.value = result.info.secure_url;
          saveAvatar();
        }
      },
    );
  }
});

const loadCloudinary = async () => {
  cloudinaryLoadError.value = false;
  cloudinaryLoaded.value = false;
  try {
    if (!('cloudinary' in window)) {
      await loadScript('https://upload-widget.cloudinary.com/global/all.js');
    }
    cloudinaryLoaded.value = true;
  } catch (error) {
    console.error(error);
    cloudinaryLoadError.value = true;
  }
};

onMounted(() => loadCloudinary());
</script>
