import { createSeedState, FILTERS } from '@/data/demo-data';

export type { Meetup } from '@/data/demo-data';

// Compatibility exports for legacy previews. App screens use DemoAppContext so
// mutations remain shared and persisted across routes.
export const CATEGORIES = FILTERS;
export const MEETUPS = createSeedState().meetups;
