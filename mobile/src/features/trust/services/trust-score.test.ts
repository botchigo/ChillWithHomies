import { describe, expect, it } from 'vitest';
import { applyCompletedMeetupReward, applyNoShowPenalty, formatTrustScore } from '@/src/features/trust/services/trust-score';

describe('trust-score', () => {
  it('phạt no-show giảm tối đa 5 và sàn 40', () => {
    expect(applyNoShowPenalty({ reliabilityScore: 90, noShowCount: 0 }).reliabilityScore).toBe(85);
    expect(applyNoShowPenalty({ reliabilityScore: 41, noShowCount: 0 }).reliabilityScore).toBe(40);
  });

  it('thưởng hoàn thành tăng 1 và trần 100', () => {
    expect(applyCompletedMeetupReward({ completedKeos: 1, reliabilityScore: 99 }).reliabilityScore).toBe(100);
    expect(applyCompletedMeetupReward({}).completedKeos).toBe(1);
  });

  it('hiển thị Mới khi chưa có điểm', () => {
    expect(formatTrustScore(undefined)).toBe('Mới');
    expect(formatTrustScore(98)).toContain('98%');
  });
});
