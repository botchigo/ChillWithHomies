import type { TrustMetrics } from '@/src/features/trust/types';

export function formatTrustScore(score?: number) {
  if (score == null) return 'Mới';
  return `${score}% uy tín`;
}

export function applyNoShowPenalty(metrics: TrustMetrics): TrustMetrics {
  return {
    ...metrics,
    noShowCount: (metrics.noShowCount ?? 0) + 1,
    reliabilityScore: Math.max(40, (metrics.reliabilityScore ?? 90) - 5),
  };
}

export function applyCompletedMeetupReward(metrics: TrustMetrics): TrustMetrics {
  return {
    ...metrics,
    completedKeos: (metrics.completedKeos ?? 0) + 1,
    reliabilityScore: Math.min(100, (metrics.reliabilityScore ?? 85) + 1),
  };
}
