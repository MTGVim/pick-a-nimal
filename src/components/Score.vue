<script setup lang="ts">
import { computed, onMounted, ref, toRefs, watch } from 'vue';

import confetti from 'canvas-confetti';
import dayjs from 'dayjs';
import _ from 'lodash';

import { getBestStats, saveScore, type Difficulty } from '../libs/leaderboard';

const props = defineProps({
    flipCount: {
        type: Number,
        required: true,
    },
    remainedMatchCount: {
        type: Number,
        required: true,
    },
    startTime: {
        type: Number,
        required: true,
    },
    difficulty: {
        type: String,
        required: true,
    },
});

const {
    flipCount,
    remainedMatchCount,
    startTime,
    difficulty,
} = toRefs(props);

const clearFlipCount = ref(0);
const clearElapsedTime = ref(0);
const clearElapsedTimeText = computed(() => (
    clearElapsedTime.value === 0 ? '없음' :
        dayjs(clearElapsedTime.value).format('mm분 ss초')
));

const bestFlipCount = ref(0);
const bestElapsedTime = ref(0);
const bestElapsedTimeText = computed(() => (
    bestElapsedTime.value === 0 ? '없음' :
        dayjs(bestElapsedTime.value).format('mm분 ss초')
));
const currentRoundFlipCount = computed(() => (
    clearElapsedTime.value === 0 ? flipCount.value : clearFlipCount.value
));

const refreshBestScores = () => {
    const best = getBestStats(difficulty.value as Difficulty);
    bestFlipCount.value = best.bestFlipCount;
    bestElapsedTime.value = best.bestElapsedTime;
};

const insertScore = ({
    elapsedTime,
    flipCount,
}: {
    elapsedTime: number,
    flipCount: number,
}) => {
    saveScore({
        elapsedTime,
        flipCount,
        createdAt: dayjs().valueOf(),
        difficulty: difficulty.value as Difficulty,
    });
};

const bragCopyStatus = ref<null | 'success' | 'error'>(null);

const gameBragMessages = [
    '최고 기록: $BEST_TIME | $BEST_FLIP_COUNT 회! 🧠 기억력 상승 중!',
    '기억력 챌린지! 내 기록: $BEST_TIME | $BEST_FLIP_COUNT 회 😎',
    '$BEST_TIME | $BEST_FLIP_COUNT 회! 이 정도면 기억력 만렙? 🤯',
    '기억력 게임 도전 완료! 기록: $BEST_TIME | $BEST_FLIP_COUNT 회 🎯',
    '$BEST_TIME | $BEST_FLIP_COUNT 회! 너도 이 기록 깰 수 있어? 💪',
    '내 기억력 테스트 결과 ➡ $BEST_TIME | $BEST_FLIP_COUNT 회 🔍',
    '최고 기록 갱신! $BEST_TIME | $BEST_FLIP_COUNT 회 🎉 도전해봐!',
    '카드 매칭 고수 등장! 기록: $BEST_TIME | $BEST_FLIP_COUNT 회 🃏',
    '기억력 폭발! $BEST_TIME | $BEST_FLIP_COUNT 회로 신기록 달성 ✨',
    '$BEST_TIME | $BEST_FLIP_COUNT 회 클리어! 뇌가 더 좋아진 느낌? 🤔',
    '도전 완료! $BEST_TIME | $BEST_FLIP_COUNT 회 💥 더 빠르게 가능?',
    '메모리 킹 등극! $BEST_TIME | $BEST_FLIP_COUNT 회 👑',
    '이제 기억력 레벨업! 기록: $BEST_TIME | $BEST_FLIP_COUNT 회 🚀',
    '내 집중력 실화? $BEST_TIME | $BEST_FLIP_COUNT 회로 증명 🔥',
    '기억력 올타임 하이! $BEST_TIME | $BEST_FLIP_COUNT 회 📈',
];

const copyGameBragMessageAsync = async () => {
    const message = _.sample(gameBragMessages)!;
    const challengeUrl = new URL(import.meta.env.BASE_URL, window.location.origin).toString();
    const formattedMessage = message
        .replace('$BEST_TIME', bestElapsedTimeText.value)
        .replace('$BEST_FLIP_COUNT', bestFlipCount.value.toString())
        + `\n나도 도전하기: ${challengeUrl}`;

    try {
        await navigator.clipboard.writeText(formattedMessage);
        bragCopyStatus.value = 'success';
    } catch {
        bragCopyStatus.value = 'error';
    }

    setTimeout(() => {
        bragCopyStatus.value = null;
    }, 2000);
};

watch(() => remainedMatchCount.value, (count) => {
    if (count !== 0) {
        return;
    }

    confetti({
        particleCount: 200,
        colors: ['#42b883', '#35495e'],
        spread: 70,
        origin: { x: 0, y: 0.8 },
    });
    confetti({
        particleCount: 200,
        colors: ['#42b883', '#35495e'],
        spread: 70,
        origin: { x: 1, y: 0.8 },
    });

    const clearTime = dayjs().valueOf();
    const current = clearTime - (startTime.value ?? 0);

    clearFlipCount.value = flipCount.value;
    clearElapsedTime.value = current;

    insertScore({
        elapsedTime: current,
        flipCount: flipCount.value,
    });
    refreshBestScores();
});

onMounted(() => {
    refreshBestScores();
});

watch(() => difficulty.value, () => {
    refreshBestScores();
});
</script>

<template>
    <section class="score">
        <p class="status">남은 쌍: {{ remainedMatchCount }} | 기록: {{ clearElapsedTimeText }} | 뒤집기 {{ currentRoundFlipCount }}회</p>
        <div v-if="bestFlipCount > 0">
            <b>👑 최고 기록 👑</b><br />
            <span>{{ bestElapsedTimeText }} | 뒤집기 {{ bestFlipCount }}회 |
                <button v-if="bestFlipCount > 0" class="shareButton" @click="copyGameBragMessageAsync">공유</button>
            </span>
        </div>
        <span v-if="bragCopyStatus === 'success'">클립보드에 복사 완료! ✅</span>
        <span v-if="bragCopyStatus === 'error'">복사 실패 ❌</span>
    </section>
</template>

<style scoped>
*:not(i) {
    font-family: "Noto Sans KR", serif;
    font-optical-sizing: auto;
    font-style: normal;
}

.score {
    margin-top: 0.2rem;
    margin-bottom: 1rem;
    text-align: center;
    font-size: 0.95rem;
}

.status {
    font-size: 1rem;
    font-weight: 700;
    margin: 0.1rem 0;
}

.shareButton {
    border: solid 1px lightgray;
    background-color: white;
    border-radius: 4px;
    color: #555;
    cursor: pointer;
    font-size: 0.75rem;
    padding: 0.15rem 0.4rem;
}
</style>
