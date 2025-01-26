<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import confetti from 'canvas-confetti';
import dayjs from 'dayjs';
import _ from 'lodash';

const animals = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'] as const;

const started = ref(false);

const cards = ref(
    Array
        .from({ length: animals.length }, (_, i) => i)
        .flatMap((i) => {
            return [
                { id: i * 2, value: animals[i], faceup: true },
                { id: i * 2 + 1, value: animals[i], faceup: true },
            ];
        })
);

const selectedCards = ref<{ id: number, value: typeof animals[number], faceup: boolean }[]>([]);
const matchedIds = ref(new Set<number>());

const startLabel = computed(() => {
    return started.value ? '다시 하기' : '시작 하기';
});

const remainedMatchCount = computed(() => {
    return (cards.value.length - matchedIds.value.size) / 2;
});

const startTime = ref(dayjs().valueOf());
const endTime = ref(0);
const flipCount = ref(0);

const elapsedTime = computed(() => {
    return dayjs(endTime.value - startTime.value).format('mm분 ss초');
});

const bestTime = ref((() => {
    const stored = localStorage.getItem('bestTime');
    if (!stored)
        return '없음';
    return dayjs(Number(stored)).format('mm분 ss초');
})())

const bestFlipCount = ref((() => {
    const stored = localStorage.getItem('bestFlipCount');
    if (!stored)
        return 0;
    return Number(stored);
})());

const brogCopyStatus = ref<null | 'success' | 'error'>(null);

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
        .replace('$BEST_TIME', bestTime.value)
        .replace('$BEST_FLIP_COUNT', bestFlipCount.value.toString())
        + '\n나도 도전하기: https://pick-a-nimal.web.app/';

    try {

        await navigator.clipboard.writeText(formattedMessage);
        brogCopyStatus.value = 'success';
    } catch (err: unknown) {
        brogCopyStatus.value = 'error';
    }

    setTimeout(() => {
        brogCopyStatus.value = null;
    }, 2000);

};

watch(() => remainedMatchCount.value, (count) => {
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
        endTime.value = dayjs().valueOf();

        const current = endTime.value - startTime.value;

        const storedBestTime = localStorage.getItem('bestTime');

        if (!storedBestTime) {
            localStorage.setItem('bestTime', current.toString());
            bestTime.value = dayjs(Number(current)).format('mm분 ss초');
        } else {
            const best = Math.min(Number(storedBestTime), Number(current))
            localStorage.setItem('bestTime', best.toString());
            bestTime.value = dayjs(best).format('mm분 ss초');
        }

        const storedBestFlipCount = localStorage.getItem('bestFlipCount');

        if (!storedBestFlipCount) {
            localStorage.setItem('bestFlipCount', flipCount.value.toString());
            bestFlipCount.value = flipCount.value;
        } else {
            const best = Math.min(Number(storedBestFlipCount), flipCount.value)
            localStorage.setItem('bestFlipCount', best.toString());
            bestFlipCount.value = best;
        }
    }
});

const onCardClick = (cardId: number) => {
    const card = cards.value.find(card => card.id === cardId);

    if (card === undefined || card.faceup)
        return;

    if (selectedCards.value.length === 2)
        return;

    flipCount.value += 1;

    card.faceup = true;

    selectedCards.value.push(card);

    if (selectedCards.value.length === 2) {
        const [first, second] = selectedCards.value;
        const firstCard = cards.value.find(card => card.id === first.id)!;
        const secondCard = cards.value.find(card => card.id === second.id)!;

        if (firstCard?.value === secondCard?.value) {
            matchedIds.value.add(firstCard?.id);
            matchedIds.value.add(secondCard?.id);
            selectedCards.value = [];
        }
        else {
            setTimeout(() => {
                firstCard.faceup = false;
                secondCard.faceup = false;
                selectedCards.value = [];
            }, 1000);
        }
    }
};

const onRestart = () => {
    selectedCards.value = [];
    matchedIds.value = new Set<number>();
    cards.value = _.shuffle(cards.value).map((card) => {
        card.faceup = false;
        return card;
    });
    started.value = true;
    startTime.value = dayjs().valueOf();
    flipCount.value = 0;
    endTime.value = 0;
};

</script>

<template>
    <h1 class="title">Pick A-nimal</h1>
    <section class="description">
        <p>카드 두 장을 선택해 뒤집으세요.<br /> 모든 쌍을 찾으세요! 💪 </p>
    </section>
    <section class="buttons">
        <button class="gameStart" v-on:click="onRestart">{{ startLabel }}</button>
    </section>
    <TransitionGroup tag="section" class="board" name="shuffle-card">
        <div class='card' v-for="item in cards" :key="item.id" v-on:click="onCardClick(item.id)" v-bind:class="{
            faceup: item.faceup,
            facedown: !item.faceup,
        }">
            <div class="back"></div>
            <div class="front">
                {{ item.value }}
            </div>
        </div>
    </TransitionGroup>
    <section class="score">
        <p v-if="endTime === 0"> 남은 쌍: {{ remainedMatchCount }}</p>
        <p v-else> 걸린 시간: {{ elapsedTime }} | 뒤집기 {{ flipCount }}회</p>
        <b>👑 최고 기록 👑</b><br />
        {{ bestTime }} | 뒤집기 {{ bestFlipCount }}회
        <i v-if="bestFlipCount > 0" @click="copyGameBragMessageAsync" v-bind:class="{
            'fas fa-share-square': !brogCopyStatus || brogCopyStatus === 'success',
            'fas fa-times': brogCopyStatus === 'error',
        }"></i><br />
        <span v-if="brogCopyStatus === 'success'">클립보드에 복사 완료! <i class="fas fa-check"></i></span>
    </section>
    <section class="footer">
        <p class="battery">
            Powered by <i class="fab fa-vuejs">3</i> <br />
            <a href="https://tigeryoo-portfolio.web.app/">🧑‍💻</a> |
            <a href="https://github.com/MTGVim/find-a-nimal"><i class="fab fa-github"></i></a>
        </p>
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

.description {
    margin-bottom: 1rem;
    text-align: center;
}

.battery {
    font-size: 0.8rem;
    color: #34495E;
}

.battery .fa-vuejs {
    color: #41B883;
}

.card {
    aspect-ratio: 1 / 1.3;
    font-size: 3rem;
    max-height: 180px;
    position: relative;
}

.card .front {
    align-items: center;
    backface-visibility: hidden;
    background-color: antiquewhite;
    border-radius: 8px;
    display: flex;
    height: 100%;
    justify-content: center;
    position: absolute;
    transition: all 0.5s ease-out;
    width: 100%;
}

.card.facedown .front {
    transform: rotateY(180deg) scale(0.7);
}

.card.faceup .front {
    transform: rotateY(0deg) scale(1);
}

.card .back {
    align-items: center;
    backface-visibility: hidden;
    background-color: steelblue;
    border-radius: 8px;
    display: flex;
    height: 100%;
    justify-content: center;
    position: absolute;
    transition: all 0.5s ease-out;
    width: 100%;
}

.card.facedown .back {
    transform: rotateY(0deg) scale(1);
}

.card.faceup .back {
    transform: rotateY(180deg) scale(0.7);
}


.board {
    display: grid;
    gap: 12px;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    justify-content: center;
    margin: 0 auto;
    max-width: 360px;
    padding: 0 24px;
}

.score {
    margin-top: 1rem;
    text-align: center;
    font-size: small;
}

.buttons {
    margin-top: 1rem;
    padding-bottom: 20px;
    text-align: center;
}

.gameStart {
    background-color: #4CAF50;
    border-radius: 5px;
    border: none;
    color: white;
    cursor: pointer;
    font-size: large;
    padding: 0.5rem 1rem;
}

.shuffle-card-move {
    transition: transform 0.4s ease-in;
}

.footer {
    text-align: right;
    padding-right: 8px;
    padding-bottom: 20px;
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
