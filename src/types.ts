export type Word = {
  id: string;
  front: string;
  back: string;
  example?: string;
};

export type SessionPhase = 'home' | 'baseline' | 'training' | 'complete';

export type SessionState = {
  phase: SessionPhase;
  activeSetIds: string[];
  masteredOnceIds: string[];
  baselineOrderIds: string[];
  baselineIndex: number;
  trainingPoolIds: string[];
  batchWordsIds: string[];
  runIndex: number;
  runHadMistake: boolean;
  consecutiveStreakRuns: number;
  currentBatchSize: number;
};
