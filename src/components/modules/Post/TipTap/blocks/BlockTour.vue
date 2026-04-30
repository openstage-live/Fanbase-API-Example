<template>
  <div class="tour-events-wrapper">
    <div class="tour-events">
      <div v-if="eventsToDisplay.length === 0 && artist?.url" class="tour-events-empty">
        <Button
          as="a"
          :href="artist.url ?? '#'"
          variant="white"
          size="lg"
          target="_blank"
          rel="noopener noreferrer"
          class="event-button"
        >
          View on Bandsintown
        </Button>
      </div>
      <template v-else>
        <div
          v-for="event in eventsToDisplay"
          :key="event.id"
          class="event-card rounded-xl border border-white/10 bg-white/5 p-4"
        >
          <div class="event-row">
            <p class="event-date text-white/80">{{ formatDate(event.datetime ?? '') }}</p>

            <div class="event-details text-white">
              <p>
                <strong>
                  {{ event.venue?.name ?? '' }}
                </strong>
              </p>
              <p class="text-white/70">{{ formatLocation(event.venue) }}</p>
            </div>

            <Button
              as="a"
              :href="event.url ?? '#'"
              :variant="event.sold_out ? 'outline' : 'white'"
              size="lg"
              target="_blank"
              rel="noopener noreferrer"
              class="event-button"
            >
              {{ event.sold_out ? 'Sold Out' : 'Tickets' }}
            </Button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BandsInTownVenueItem } from '@/api/bandsInTown';
import type { NodeProps } from './RenderNode.vue';
import { computed } from 'vue';
import { format, parseISO, isValid } from 'date-fns';
import { getTourAttrs } from '../extensions/Tour/TourExtension';
import { storeToRefs } from 'pinia';
import { useBandsInTownStore } from '@/stores/bandsInTown.store';
import Button from '@ui/button/Button.vue';

const props = defineProps<NodeProps>();
const attrs = computed(() => getTourAttrs(props.node.attrs));

const bandsInTownStore = useBandsInTownStore();
const { events, artist } = storeToRefs(bandsInTownStore);

const eventsToDisplay = computed(() =>
  (events.value ?? []).slice(0, attrs.value.maxEvents ?? undefined),
);

function formatDate(datetime: string): string {
  try {
    const date = parseISO(datetime);
    return isValid(date) ? format(date, 'MMM d, yyyy') : '';
  } catch {
    return '';
  }
}

function formatLocation(venue: BandsInTownVenueItem | null | undefined): string {
  if (!venue) return '';
  return [venue.city, venue.region].filter(Boolean).join(', ');
}
</script>

<style scoped>
.tour-events-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tour-events-empty {
  display: flex;
  justify-content: center;
}

.tour-events {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-row {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  align-items: center;
  gap: 8px;
}

.event-details {
  display: flex;
  flex-direction: column;
}

@media (max-width: 480px) {
  .event-row {
    grid-template-columns: 1fr;
  }

  .event-date,
  .event-details p {
    text-align: center;
  }
}
</style>
