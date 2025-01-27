<script setup lang="ts">
import { computed, ref, toRefs, watch } from 'vue';

import confetti from 'canvas-confetti';
import dayjs from 'dayjs';
import _ from 'lodash';

import { supabase } from '../lib/supabase';

const props = defineProps({
    flipCount: {
        type: Number,
        required: true,
    },
    remainedMatchCount:{
        Number,
        required: true,
    },
    session: {
        type: Object,
        default: {},
    },
    startTime: {
        type: Number,
        required: true,
    },
})

const {
    flipCount,
    remainedMatchCount,
    session,
    startTime,
} = toRefs(props);

const loading = ref(true);

const clearFlipCount = ref(0);
const clearElapsedTime = ref(0);
const clearElapsedTimeText = computed(() =>(
    clearElapsedTime.value === 0 ? '없음' :
    dayjs(clearElapsedTime.value).format('mm분 ss초')
));

const bestFlipCount = ref(0);
const bestElapsedTime = ref(0);
const bestElapsedTimeText = computed(() =>(
    bestElapsedTime.value === 0 ? '없음' :
    dayjs(bestElapsedTime.value).format('mm분 ss초')
));

watch(session, (sessionValue) => {
    if(sessionValue) {
        fetchBestScores();
    }
});

async function getBestFlipCount(session: any) {
    try {
        loading.value = true
        const { user } = session;

        const { data, error, status } = await supabase
            .from('best_flip_counts')
            .select('flip_count')
            .order('flip_count', { ascending: true })
            .eq('user_id', user.id)
            .limit(1)

        if (error && status !== 406) throw error

        bestFlipCount.value = data?.at(0)?.flip_count ?? 0;
    } catch (error) {
        if(error instanceof Error) {
            console.error(error.message)
        }
    } finally {
        loading.value = false
    }
}

async function getBestElapsedTime(session: any) {
    try {
        loading.value = true
        const { user } = session;

        const { data, error, status } = await supabase
            .from('best_times')
            .select('elapsed_time')
            .order('elapsed_time', { ascending: true })
            .eq('user_id', user.id)
            .limit(1)

        if (error && status !== 406) throw error

        bestElapsedTime.value = data?.at(0)?.elapsed_time ?? 0;
    } catch (error: unknown) {
        if(error instanceof Error) {
            console.error(error.message)
        }
    } finally {
        loading.value = false
    }
}

const fetchBestScores = async () => {
    await getBestFlipCount(session.value);
    await getBestElapsedTime(session.value);
}

async function insertScore({
    elapsedTime,
    flipCount,
}: {
    elapsedTime: number,
    flipCount: number,
}) {
    try {
        loading.value = true
        const { user } = session.value;

        const { error, status } = await supabase
            .from('best_flip_counts')
            .insert({
                user_id: user.id,
                flip_count: flipCount,
            })

        if (error && status !== 406) throw error

        const { error: timeError, status: timeStatus } = await supabase
            .from('best_times')
            .insert({
                user_id: user.id,
                elapsed_time: elapsedTime,
            })

        if (timeError && timeStatus !== 406) throw error

    } catch (error: unknown) {
        if(error instanceof Error) {
            console.error(error.message)
        }
    } finally {
        loading.value = false
    }
}


const brogCopyStatus = ref < null | 'success' | 'error' > (null);

const gameBragMessages = [
    "최고 기록: $BEST_TIME | $BEST_FLIP_COUNT 회! 🧠 기억력 상승 중!",
    "기억력 챌린지! 내 기록: $BEST_TIME | $BEST_FLIP_COUNT 회 😎",
    "$BEST_TIME | $BEST_FLIP_COUNT 회! 이 정도면 기억력 만렙? 🤯",
    "기억력 게임 도전 완료! 기록: $BEST_TIME | $BEST_FLIP_COUNT 회 🎯",
    "$BEST_TIME | $BEST_FLIP_COUNT 회! 너도 이 기록 깰 수 있어? 💪",
    "내 기억력 테스트 결과 ➡ $BEST_TIME | $BEST_FLIP_COUNT 회 🔍",
    "최고 기록 갱신! $BEST_TIME | $BEST_FLIP_COUNT 회 🎉 도전해봐!",
    "카드 매칭 고수 등장! 기록: $BEST_TIME | $BEST_FLIP_COUNT 회 🃏",
    "기억력 폭발! $BEST_TIME | $BEST_FLIP_COUNT 회로 신기록 달성 ✨",
    "$BEST_TIME | $BEST_FLIP_COUNT 회 클리어! 뇌가 더 좋아진 느낌? 🤔",
    "도전 완료! $BEST_TIME | $BEST_FLIP_COUNT 회 💥 더 빠르게 가능?",
    "메모리 킹 등극! $BEST_TIME | $BEST_FLIP_COUNT 회 👑",
    "이제 기억력 레벨업! 기록: $BEST_TIME | $BEST_FLIP_COUNT 회 🚀",
    "내 집중력 실화? $BEST_TIME | $BEST_FLIP_COUNT 회로 증명 🔥",
    "기억력 올타임 하이! $BEST_TIME | $BEST_FLIP_COUNT 회 📈"
];

const copyGameBragMessageAsync = async () => {
    const message = _.sample(gameBragMessages)!;
    const formattedMessage = message
        .replace('$BEST_TIME', bestElapsedTimeText.value)
        .replace('$BEST_FLIP_COUNT', bestFlipCount.value.toString())
        + '\n나도 도전하기: https://pick-a-nimal.web.app/';

    try {
        await navigator.clipboard.writeText(formattedMessage);
        brogCopyStatus.value = 'success';
    } catch (err) {
        brogCopyStatus.value = 'error';
    }

    setTimeout(() => {
        brogCopyStatus.value = null;
    }, 2000);

};


watch(() => remainedMatchCount?.value, (count) => {
    if (count === 0) {

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
        
        const current = clearTime - (startTime?.value ?? 0);

        clearFlipCount.value = flipCount?.value;
        clearElapsedTime.value = current;

        insertScore({
            elapsedTime: current,
            flipCount: flipCount?.value,
        }).then(() => {
            fetchBestScores();
        });
    }
});


</script>

<template>
    <section class="score">
        <p v-if="clearElapsedTime === 0 "> 남은 쌍: {{ remainedMatchCount }}</p>
        <p v-else> 이번 기록: {{ clearElapsedTimeText }} | 뒤집기 {{ flipCount }}회</p>
        <div v-if="bestFlipCount > 0">
            <b>👑 최고 기록 👑</b><br />
            <span>{{ bestElapsedTimeText }} | 뒤집기 {{ bestFlipCount }}회 | 
                <i v-if="bestFlipCount > 0" @click="copyGameBragMessageAsync" v-bind:class="{
                    'fas fa-share-square': !brogCopyStatus || brogCopyStatus === 'success',
                    'fas fa-times': brogCopyStatus === 'error',
                }"></i>
            </span>
        </div>
        <span v-if="brogCopyStatus === 'success'">클립보드에 복사 완료! <i class="fas fa-check"></i></span>
    </section>
</template>

<style scoped>
.score {
    margin-top: 1rem;
    text-align: center;
    font-size: small;
}

.fa-share-square {
    cursor: pointer;
}

.fa-check {
    color: #4CAF50;
}

.fa-times {
    color: #F44336;
}
</style>