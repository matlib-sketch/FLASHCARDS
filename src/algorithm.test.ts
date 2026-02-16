import { describe, expect, it } from 'vitest';
import { answerBaseline, answerTraining, createSession } from './algorithm';
import type { Word } from './types';

const words: Word[] = Array.from({ length: 8 }).map((_, index) => ({
  id: `w${index + 1}`,
  front: `front${index + 1}`,
  back: `back${index + 1}`
}));

const fixedRandom = () => 0.1;

describe('algorithm', () => {
  it('moves known baseline words to masteredOnce and enters training', () => {
    let state = createSession(words, fixedRandom);
    expect(state.phase).toBe('baseline');

    for (let i = 0; i < 3; i += 1) {
      state = answerBaseline(state, true);
    }

    for (let i = 3; i < words.length; i += 1) {
      state = answerBaseline(state, false);
    }

    expect(state.phase).toBe('training');
    expect(state.masteredOnceIds.length).toBe(3);
    expect(state.trainingPoolIds.length).toBe(words.length - 3);
    expect(state.batchWordsIds.length).toBe(3);
  });

  it('resets streak on wrong answer and grows batch by 3 after two perfect runs', () => {
    let state = createSession(words, fixedRandom);

    for (let i = 0; i < words.length; i += 1) {
      state = answerBaseline(state, false);
    }

    expect(state.phase).toBe('training');

    state = answerTraining(state, false);
    state = answerTraining(state, true);
    state = answerTraining(state, true);
    expect(state.consecutiveStreakRuns).toBe(0);

    for (let run = 0; run < 2; run += 1) {
      state = answerTraining(state, true);
      state = answerTraining(state, true);
      state = answerTraining(state, true);
    }

    expect(state.batchWordsIds.length).toBe(6);
    expect(state.currentBatchSize).toBe(6);
    expect(state.consecutiveStreakRuns).toBe(0);
  });

  it('completes session after all words added and two perfect runs', () => {
    let state = createSession(words.slice(0, 4), fixedRandom);
    for (let i = 0; i < 4; i += 1) {
      state = answerBaseline(state, false);
    }

    for (let i = 0; i < 6; i += 1) {
      state = answerTraining(state, true);
      state = answerTraining(state, true);
      state = answerTraining(state, true);
      if (state.phase === 'training' && state.batchWordsIds.length === 4) {
        break;
      }
    }

    expect(state.phase).toBe('training');
    expect(state.batchWordsIds.length).toBe(4);

    for (let run = 0; run < 2; run += 1) {
      for (let i = 0; i < 4; i += 1) {
        state = answerTraining(state, true);
      }
    }

    expect(state.phase).toBe('complete');
  });
});
