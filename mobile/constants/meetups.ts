import { createSeedState } from '@/data/demo-data';
import { SESSION_FILTERS } from '@/src/features/sessions/constants';

export type { Meetup } from '@/src/features/sessions/types';

// Compatibility exports for legacy previews. App screens use DemoAppContext so
// mutations remain shared and persisted across routes.
export const CATEGORIES = SESSION_FILTERS;
export const MEETUPS = createSeedState().meetups;
