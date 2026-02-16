import type { SessionState, Word } from './types';

const MAX_ACTIVE_WORDS = 50;
const BATCH_STEP = 3;

export const shuffle = <T>(items: T[], random: () => number = Math.random): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const createSession = (words: Word[], random: () => number = Math.random): SessionState => {
  const picked = shuffle(words.map((word) => word.id), random).slice(0, MAX_ACTIVE_WORDS);

  return {
    phase: 'baseline',
    activeSetIds: picked,
    masteredOnceIds: [],
    baselineOrderIds: shuffle(picked, random),
    baselineIndex: 0,
    trainingPoolIds: [],
    batchWordsIds: [],
    runIndex: 0,
    runHadMistake: false,
    consecutiveStreakRuns: 0,
    currentBatchSize: 0
  };
};

export const answerBaseline = (state: SessionState, knewIt: boolean): SessionState => {
  if (state.phase !== 'baseline') {
    return state;
  }

  const currentWordId = state.baselineOrderIds[state.baselineIndex];
  if (!currentWordId) {
    return state;
  }

  const masteredOnceIds = knewIt ? [...state.masteredOnceIds, currentWordId] : [...state.masteredOnceIds];

  const baselineIndex = state.baselineIndex + 1;
  if (baselineIndex < state.baselineOrderIds.length) {
    return {
      ...state,
      masteredOnceIds,
      baselineIndex
    };
  }

  const masteredSet = new Set(masteredOnceIds);
  const trainingPoolIds = state.baselineOrderIds.filter((id) => !masteredSet.has(id));

  if (trainingPoolIds.length === 0) {
    return {
      ...state,
      phase: 'complete',
      masteredOnceIds,
      baselineIndex,
      trainingPoolIds,
      batchWordsIds: [],
      currentBatchSize: 0,
      runIndex: 0,
      consecutiveStreakRuns: 0,
      runHadMistake: false
    };
  }

  const initialBatchSize = Math.min(BATCH_STEP, trainingPoolIds.length);

  return {
    ...state,
    phase: 'training',
    masteredOnceIds,
    baselineIndex,
    trainingPoolIds,
    batchWordsIds: trainingPoolIds.slice(0, initialBatchSize),
    currentBatchSize: initialBatchSize,
    runIndex: 0,
    consecutiveStreakRuns: 0,
    runHadMistake: false
  };
};

export const answerTraining = (state: SessionState, correct: boolean): SessionState => {
  if (state.phase !== 'training' || state.batchWordsIds.length === 0) {
    return state;
  }

  const runHadMistake = state.runHadMistake || !correct;

  if (state.runIndex < state.batchWordsIds.length - 1) {
    return {
      ...state,
      runIndex: state.runIndex + 1,
      runHadMistake
    };
  }

  const nextStreak = runHadMistake ? 0 : state.consecutiveStreakRuns + 1;

  if (nextStreak >= 2) {
    if (state.batchWordsIds.length >= state.trainingPoolIds.length) {
      return {
        ...state,
        phase: 'complete',
        consecutiveStreakRuns: nextStreak,
        runIndex: 0,
        runHadMistake: false
      };
    }

    const expandedBatchSize = Math.min(state.batchWordsIds.length + BATCH_STEP, state.trainingPoolIds.length);
    return {
      ...state,
      batchWordsIds: state.trainingPoolIds.slice(0, expandedBatchSize),
      currentBatchSize: expandedBatchSize,
      consecutiveStreakRuns: 0,
      runIndex: 0,
      runHadMistake: false
    };
  }

  return {
    ...state,
    consecutiveStreakRuns: nextStreak,
    runIndex: 0,
    runHadMistake: false
  };
};

export const getWordById = (words: Word[], id: string | undefined): Word | undefined => {
  if (!id) {
    return undefined;
  }

  return words.find((word) => word.id === id);
};
