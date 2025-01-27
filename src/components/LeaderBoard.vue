<script setup lang="ts">
import { onMounted, ref } from 'vue';

import dayjs from 'dayjs';

import { supabase } from '../lib/supabase';
import Button from './Button.vue';
import Navigate from './Navigate.vue';

const loading = ref(false);

const bestFlipCountList = ref<{
    username: string;
    createdAt: string;
    flipCount: number;
}[]>([]);

const bestElapsedTimeList = ref<{
    username: string;
    createdAt: string;
    elapsedTime: number;
}[]>([]);

const groupBy = ref<'elpasedTime' | 'flipCount'>('elpasedTime');

onMounted(() => {
    fetchLeaderBoardScores();
});

async function getBestFlipCountList() {
    try {
        loading.value = true

        const { data, error, status } = await supabase
            .from('best_flip_counts')
            .select('flip_count, created_at, profiles( username )')
            .order('flip_count', { ascending: true })
            .limit(10)

        if (error && status !== 406) throw error

        bestFlipCountList.value = data?.map(
            ({ profiles, flip_count, created_at }) => ({
                username: (profiles as unknown as { username: string }).username,
                flipCount: flip_count,
                createdAt: dayjs(created_at).format('YYYY-MM-DD HH:mm'),
            })
        ) ?? [];
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message)
        }
    } finally {
        loading.value = false
    }
}

async function getBestElapsedTimeList() {
    try {
        loading.value = true

        const { data, error, status } = await supabase
            .from('best_times')
            .select('elapsed_time, created_at, profiles(username)')
            .order('elapsed_time', { ascending: true })
            .limit(10)

        if (error && status !== 406) throw error

        bestElapsedTimeList.value = data?.map(
            ({ profiles, elapsed_time, created_at }) => ({
                username: (profiles as unknown as { username: string }).username,
                elapsedTime: elapsed_time,
                createdAt: dayjs(created_at).format('YYYY-MM-DD HH:mm'),
            })
        ) ?? [];
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message)
        }
    } finally {
        loading.value = false
    }
}

const fetchLeaderBoardScores = async () => {
    await getBestFlipCountList();
    await getBestElapsedTimeList();
}

const handleTabClick = (tab: 'elpasedTime' | 'flipCount') => {
    groupBy.value = tab;
}

const handleRefreshClick = () => {
    fetchLeaderBoardScores();
}

</script>

<template>
    <h1 class="title">리더보드</h1>
    <section class="column">
        <p>🏆 최고 기록을 갱신한 유저들을 확인하세요!</p>
    </section>
    <section class="buttons row">
        <Navigate href="/">🔙 게임하러 가기</Navigate>
        <Button v-on:click="handleRefreshClick">🔄 새로고침</Button>
        <Button v-on:click="handleTabClick('elpasedTime')">⏰ 클리어 시간 기준</Button>
        <Button v-on:click="handleTabClick('flipCount')">🍳 뒤집은 횟수 기준</Button>
    </section>
    <section v-if="loading" class="column">
        <p>Loading...</p>
    </section>
    <section class="column table-container" v-else>
        <table v-if="groupBy === 'elpasedTime'" >
            <tbody>
                <tr>
                    <th>순위</th>
                    <th>유저명</th>
                    <th>클리어 시간</th>
                    <th>일시</th>
                </tr>
                <tr v-for="[index, score] in bestElapsedTimeList.entries()" :key="score.username + score.createdAt">
                    <td>{{ `# ${index +1} ${index===0 ? '👑 🤫' : index === 1 ? '👏' : index === 2 ? '👍' : ''}` }}</td>
                    <td>{{ score.username }}</td>
                    <td>{{ score.elapsedTime === 0 ? '없음' : dayjs(score.elapsedTime).format('mm분 ss초') }}</td>
                    <td>{{ score.createdAt }}</td>
                </tr>
            </tbody>
        </table>

        <table v-else>
            <tbody>
                <tr>
                    <th>순위</th>
                    <th>유저명</th>
                    <th>뒤집기 횟수</th>
                    <th>일시</th>
                </tr>
                <tr v-for="[index, score] in bestFlipCountList.entries()" :key="score.username + score.createdAt">
                    <td>{{ `# ${index +1} ${index===0 ? '👑 🤫' : index ===1 ? '👏' : index === 2 ? '👍' : ''}` }}</td>
                    <td>{{ score.username }}</td>
                    <td>{{ score.flipCount }} 회</td>
                    <td>{{ score.createdAt }}</td>
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

.row {
    align-items: center;
    display: flex;
    flex-direction: row;
    gap: 4px;
    justify-content: center;
}

.inputField {
    width: 160px;
    border: 1px solid lightgray;
    padding: 0.2rem 0.4rem;
    border-radius: 5px;
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
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    color: #374151;
}

table thead {
    background: #e0f2f1;
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