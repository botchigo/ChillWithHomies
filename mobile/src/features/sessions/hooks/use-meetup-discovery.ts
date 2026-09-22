import { useMemo } from 'react';

import { useDemoApp } from '@/context/demo-app-context';
import { SESSION_FILTERS, type MeetupFilter } from '@/src/features/sessions/constants';
import { calculateMeetupPreferenceScore, filterAndSortMeetups, visibleMeetupsForUser } from '@/src/features/sessions/services/session-rules';
import type { MeetupSort } from '@/src/features/sessions/types';

type DiscoveryOptions = {
  query: string;
  filters: MeetupFilter[];
  sort: MeetupSort;
  personalize?: boolean;
};

export function useMeetupDiscovery({ query, filters, sort, personalize = false }: DiscoveryOptions) {
  const { state } = useDemoApp();
  const profile = state.profile;

  const meetups = useMemo(() => {
    const results = filterAndSortMeetups(visibleMeetupsForUser(state.meetups, state.currentUser?.id), query, filters, sort);
    if (!personalize || query.trim() || filters.length) return results;
    return results
      .map((meetup, index) => ({ meetup, index, score: calculateMeetupPreferenceScore(meetup, profile.interests, profile.preferredVibes) }))
      .sort((left, right) => right.score - left.score || left.index - right.index)
      .map(({ meetup }) => meetup);
  }, [filters, personalize, profile.interests, profile.preferredVibes, query, sort, state.currentUser?.id, state.meetups]);

  const personalizedFilters = useMemo(() => {
    const preferences = new Set([...profile.interests, ...profile.preferredVibes].map((value) => value.toLocaleLowerCase('vi-VN')));
    return [SESSION_FILTERS[0], ...SESSION_FILTERS.slice(1)
      .map((filter, index) => ({ filter, index }))
      .sort((left, right) => Number(preferences.has(right.filter.toLocaleLowerCase('vi-VN'))) - Number(preferences.has(left.filter.toLocaleLowerCase('vi-VN'))) || left.index - right.index)
      .map(({ filter }) => filter)];
  }, [profile.interests, profile.preferredVibes]);

  return {
    meetups,
    personalizedFilters,
    unreadNotifications: state.notifications.filter((notification) => !notification.read).length,
  };
}
