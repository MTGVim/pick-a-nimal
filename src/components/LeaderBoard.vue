<script setup lang="ts">
import { onMounted, ref } from 'vue';

import dayjs from 'dayjs';

import {
    type Difficulty,
    getTopScoresByElapsedTime,
    getTopScoresByFlipCount,
} from '../libs/leaderboard';
import Navigate from './Navigate.vue';

const loading = ref(false);

const bestFlipCountList = ref<{
    nickname: string;
    createdAt: string;
    flipCount: number;
}[]>([]);

const bestElapsedTimeList = ref<{
    nickname: string;
    createdAt: string;
    elapsedTime: number;
}[]>([]);

const groupBy = ref<'elapsedTime' | 'flipCount'>('elapsedTime');
const difficulty = ref<Difficulty>('easy');
const difficultyLabel = ref('쉬움 4x4');

const fetchLeaderBoardScores = () => {
    loading.value = true;

    bestFlipCountList.value = getTopScoresByFlipCount(10, difficulty.value).map((score) => ({
        nickname: score.nickname,
        flipCount: score.flipCount,
        createdAt: dayjs(score.createdAt).format('YYYY-MM-DD HH:mm'),
    }));

    bestElapsedTimeList.value = getTopScoresByElapsedTime(10, difficulty.value).map((score) => ({
        nickname: score.nickname,
        elapsedTime: score.elapsedTime,
        createdAt: dayjs(score.createdAt).format('YYYY-MM-DD HH:mm'),
    }));

    loading.value = false;
};

const handleTabClick = (tab: 'elapsedTime' | 'flipCount') => {
    groupBy.value = tab;
};

const handleDifficultyClick = (value: Difficulty) => {
    difficulty.value = value;
    difficultyLabel.value = value === 'hard' ? '어려움 4x6' : '쉬움 4x4';
    fetchLeaderBoardScores();
};

onMounted(() => {
    fetchLeaderBoardScores();
});
</script>

<template>
    <h1 class="title">리더보드</h1>
    <section class="column">
        <p>🏆 {{ difficultyLabel }} 리더보드 (현재 브라우저 LocalStorage 기준)</p>
        <p class="guide">다른 기기/브라우저와 기록이 공유되지 않으며, 브라우저 데이터 삭제 시 초기화됩니다.</p>
    </section>
    <section class="buttons row">
        <Navigate href="/">🔙 게임하러 가기</Navigate>
    </section>
    <section class="buttons row">
        <Button :class="{ selected: difficulty === 'easy' }" v-on:click="handleDifficultyClick('easy')">쉬움 4x4</Button>
        <Button :class="{ selected: difficulty === 'hard' }" v-on:click="handleDifficultyClick('hard')">어려움 4x6</Button>
    </section>
    <section class="buttons row">
        <Button v-on:click="handleTabClick('elapsedTime')">⏰ 시간 기준</Button>
        <Button v-on:click="handleTabClick('flipCount')">🍳 뒤집은 횟수 기준</Button>
    </section>
    <section v-if="loading" class="column">
        <p>Loading...</p>
    </section>
    <section class="column table-container" v-else>
        <table v-if="groupBy === 'elapsedTime'">
            <tbody>
                <tr>
                    <th>순위</th>
                    <th>유저명</th>
                    <th>시간</th>
                    <th>일시</th>
                </tr>
                <tr v-for="[index, score] in bestElapsedTimeList.entries()" :key="score.nickname + score.createdAt + index">
                    <td>{{ `# ${index + 1} ${index === 0 ? '👑 🤫' : index === 1 ? '👏' : index === 2 ? '👍' : ''}` }}</td>
                    <td>{{ score.nickname }}</td>
                    <td>{{ score.elapsedTime === 0 ? '없음' : dayjs(score.elapsedTime).format('mm분 ss초') }}</td>
                    <td>{{ score.createdAt }}</td>
                </tr>
                <tr v-if="bestElapsedTimeList.length === 0">
                    <td colspan="4">아직 저장된 기록이 없습니다. 게임을 플레이해 기록을 만들어보세요.</td>
                </tr>
            </tbody>
        </table>

        <table v-else>
            <tbody>
                <tr>
                    <th>순위</th>
                    <th>유저명</th>
                    <th>횟수</th>
                    <th>일시</th>
                </tr>
                <tr v-for="[index, score] in bestFlipCountList.entries()" :key="score.nickname + score.createdAt + index">
                    <td>{{ `# ${index + 1} ${index === 0 ? '👑 🤫' : index === 1 ? '👏' : index === 2 ? '👍' : ''}` }}</td>
                    <td>{{ score.nickname }}</td>
                    <td>{{ score.flipCount }} 회</td>
                    <td>{{ score.createdAt }}</td>
                </tr>
                <tr v-if="bestFlipCountList.length === 0">
                    <td colspan="4">아직 저장된 기록이 없습니다. 게임을 플레이해 기록을 만들어보세요.</td>
                </tr>
            </tbody>
        </table>
    </section>
</template>

<style scoped>
*:not(i) {
    font-family: "Noto Sans KR", serif;
    font-optical-sizing: auto;
    font-style: normal;
}

.title {
    font-size: 2rem;
    margin-bottom: 1rem;
    text-align: center;
    color: #34495E;
}

.column {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.guide {
    margin-top: 0.2rem;
    color: #5f6368;
    font-size: 0.9rem;
    text-align: center;
}

.row {
    align-items: center;
    display: flex;
    flex-direction: row;
    gap: 4px;
    justify-content: center;
}

.table-container {
    width: 100%;
    overflow-x: auto;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    background: #f9fafb;
}

table {
    width: 100%;
    border-collapse: collapse;
    font-size: 16px;
    color: #374151;
}

table th,
table td {
    padding: 14px 20px;
    text-align: center;
}

table th {
    font-weight: 600;
    color: #1e293b;
}

table tbody tr {
    border-bottom: 1px solid #e5e7eb;
    transition: background 0.3s ease;
}

table tbody tr:hover {
    background: #f1f5f9;
}

table tbody tr:nth-child(even) {
    background: #f3f4f6;
}

table tbody td {
    color: #4b5563;
}

table tbody tr:last-child {
    border-bottom: none;
}

.buttons {
    margin-bottom: 20px;
}
</style>
