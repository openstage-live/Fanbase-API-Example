<template>
  <Swiper
    :modules
    :slides-per-view="1"
    :space-between="10"
    :autoplay="attrs.autoplay"
    :navigation="attrs.navigation"
    v-bind="$attrs"
    @init="(swiper) => (swiper.params.loop = attrs.loop)"
  >
    <SwiperSlide v-for="(image, index) in attrs.images" :key="image.src">
      <RichImage
        :image
        :show-caption="attrs.captions"
        :aspect-ratio="attrs.aspectRatio"
        class="cursor-pointer"
        @click="lightbox?.openLightbox(index)"
      />
    </SwiperSlide>
  </Swiper>

  <ImageLightbox ref="lightbox" :images="attrs.images" />
</template>

<script setup lang="ts">
import type { NodeProps } from './RenderNode.vue';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import { computed, useTemplateRef } from 'vue';
import { getCarouselAttrs } from '../extensions/Carousel/CarouselExtension';
import { Navigation, Autoplay, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/vue';
import ImageLightbox from './ImageLightbox.vue';
import RichImage from './RichImage.vue';

const modules = [Navigation, Autoplay, Pagination];
const props = defineProps<NodeProps>();
const attrs = computed(() => getCarouselAttrs(props.node.attrs));

const lightbox = useTemplateRef<InstanceType<typeof ImageLightbox>>('lightbox');
</script>
