const STORAGE_KEY = 'pick-a-nimal:scores:v1';

export type Difficulty = 'easy' | 'hard';

export type ScoreRecord = {
    nickname: string;
    flipCount: number;
    elapsedTime: number;
    createdAt: number;
    difficulty: Difficulty;
};

const isClient = () => typeof window !== 'undefined';

export const getDefaultNickname = () => 'Local Player';

export const readScores = (): ScoreRecord[] => {
    if (!isClient()) {
        return [];
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        return [];
    }

    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed
            .filter((score) => {
                return score
                    && typeof score.nickname === 'string'
                    && typeof score.flipCount === 'number'
                    && typeof score.elapsedTime === 'number'
                    && typeof score.createdAt === 'number'
                    && (score.difficulty === 'easy' || score.difficulty === 'hard' || score.difficulty === undefined);
            })
            .map((score) => ({
                nickname: score.nickname || getDefaultNickname(),
                flipCount: score.flipCount,
                elapsedTime: score.elapsedTime,
                createdAt: score.createdAt,
                difficulty: score.difficulty === 'hard' ? 'hard' : 'easy',
            }));
    } catch {
        return [];
    }
};

const writeScores = (scores: ScoreRecord[]) => {
    if (!isClient()) {
        return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
};

export const saveScore = (score: Omit<ScoreRecord, 'nickname'> & { nickname?: string }) => {
    const scores = readScores();
    scores.push({
        nickname: score.nickname ?? getDefaultNickname(),
        flipCount: score.flipCount,
        elapsedTime: score.elapsedTime,
        createdAt: score.createdAt,
        difficulty: score.difficulty,
    });
    writeScores(scores);
};

const filterByDifficulty = (scores: ScoreRecord[], difficulty?: Difficulty) => {
    if (!difficulty) {
        return scores;
    }
    return scores.filter((score) => score.difficulty === difficulty);
};

export const getBestStats = (difficulty?: Difficulty) => {
    const scores = filterByDifficulty(readScores(), difficulty);
    if (scores.length === 0) {
        return {
            bestFlipCount: 0,
            bestElapsedTime: 0,
        };
    }

    return {
        bestFlipCount: Math.min(...scores.map((score) => score.flipCount)),
        bestElapsedTime: Math.min(...scores.map((score) => score.elapsedTime)),
    };
};

export const getTopScoresByElapsedTime = (limit = 10, difficulty?: Difficulty) => {
    return filterByDifficulty(readScores(), difficulty)
        .sort((a, b) => a.elapsedTime - b.elapsedTime || a.createdAt - b.createdAt)
        .slice(0, limit);
};

export const getTopScoresByFlipCount = (limit = 10, difficulty?: Difficulty) => {
    return filterByDifficulty(readScores(), difficulty)
        .sort((a, b) => a.flipCount - b.flipCount || a.createdAt - b.createdAt)
        .slice(0, limit);
};
