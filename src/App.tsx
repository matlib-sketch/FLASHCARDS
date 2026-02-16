import { useEffect, useMemo, useState } from 'react';
import { answerBaseline, answerTraining, createSession, getWordById } from './algorithm';
import { loadSession, resetSessionStorage, saveSession } from './storage';
import type { SessionState, Word } from './types';
import './styles.css';

const App = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [session, setSession] = useState<SessionState | null>(null);
  const [showBack, setShowBack] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const response = await fetch('/data/words.json');
      const data = (await response.json()) as Word[];
      setWords(data);
      setSession(loadSession());
      setLoading(false);
    };

    void init();
  }, []);

  useEffect(() => {
    if (session) {
      saveSession(session);
    }
  }, [session]);

  const currentWord = useMemo(() => {
    if (!session) {
      return undefined;
    }

    if (session.phase === 'baseline') {
      return getWordById(words, session.baselineOrderIds[session.baselineIndex]);
    }

    if (session.phase === 'training') {
      return getWordById(words, session.batchWordsIds[session.runIndex]);
    }

    return undefined;
  }, [session, words]);

  const startSession = () => {
    setShowBack(false);
    setSession(createSession(words));
  };

  const resetSession = () => {
    resetSessionStorage();
    setSession(null);
    setShowBack(false);
  };

  if (loading) {
    return <main className="container">Loading words…</main>;
  }

  if (!session || session.phase === 'home') {
    return (
      <main className="container">
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 12 }}>
        <button
          className="secondary"
          onClick={resetSession}
          title="Reset the session and clear saved progress"
        >
          Reset
        </button>
      </div>
        <h1>Hebrew Flashcards</h1>
        <p>Repository size: {words.length} words</p>
        <button onClick={startSession} className="primary">Start Session</button>
        <button onClick={resetSession} className="secondary">Reset Session</button>
      </main>
    );
  }

  if (session.phase === 'baseline' && currentWord) {
    return (
      <main className="container">
        <h2>Baseline Sweep</h2>
        <p>Progress: {session.baselineIndex + 1}/{session.baselineOrderIds.length}</p>
        <Card word={currentWord} showBack={showBack} onFlip={() => setShowBack((v) => !v)} />
        <p>Did you know it?</p>
        <div className="row">
          <button className="primary" onClick={() => {
            setSession(answerBaseline(session, true));
            setShowBack(false);
          }}>✅ Knew it</button>
          <button className="danger" onClick={() => {
            setSession(answerBaseline(session, false));
            setShowBack(false);
          }}>❌ Didn’t know</button>
        </div>
      </main>
    );
  }

  if (session.phase === 'training' && currentWord) {
    return (
      <main className="container">
        <h2>Training {session.currentBatchSize} words</h2>
        <p>Word {session.runIndex + 1} of {session.batchWordsIds.length}</p>
        <p>Perfect runs in a row: {session.consecutiveStreakRuns}/2</p>
        <Card word={currentWord} showBack={showBack} onFlip={() => setShowBack((v) => !v)} />
        <div className="row">
          <button className="primary" onClick={() => {
            setSession(answerTraining(session, true));
            setShowBack(false);
          }}>✅ Correct</button>
          <button className="danger" onClick={() => {
            setSession(answerTraining(session, false));
            setShowBack(false);
          }}>❌ Wrong</button>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <h2>Mazel tov! Session complete 🎉</h2>
      <p>Mastered in sweep: {session.masteredOnceIds.length}</p>
      <p>Trained words: {session.trainingPoolIds.length}</p>
      <button className="primary" onClick={startSession}>Start New Session</button>
      <button className="secondary" onClick={resetSession}>Reset Session</button>
    </main>
  );
};

const Card = ({ word, showBack, onFlip }: { word: Word; showBack: boolean; onFlip: () => void }) => (
  <section className="card">
    <h3>{word.front}</h3>
    {showBack && (
      <>
        <p>{word.back}</p>
        {word.example ? <p className="example">{word.example}</p> : null}
      </>
    )}
    <button className="secondary" onClick={onFlip}>{showBack ? 'Hide' : 'Flip'}</button>
  </section>
);

export default App;
