<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';

import dayjs from 'dayjs';
import _ from 'lodash';

import Navigate from './Navigate.vue';
import Score from './Score.vue';

const { session } = defineProps(['session']);

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
const flipCount = ref(0);
const previewing = ref(false);
const previewCountdown = ref(3);
let previewIntervalId: ReturnType<typeof setInterval> | null = null;


const onCardClick = (cardId: number) => {
    const card = cards.value.find(card => card.id === cardId);

    if (previewing.value || card === undefined || card.faceup)
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
    if (previewing.value)
        return;

    selectedCards.value = [];
    matchedIds.value = new Set<number>();
    cards.value = _.shuffle(cards.value).map((card) => {
        card.faceup = true;
        return card;
    });
    started.value = true;
    flipCount.value = 0;
    previewing.value = true;
    previewCountdown.value = 3;

    if (previewIntervalId !== null) {
        clearInterval(previewIntervalId);
    }

    previewIntervalId = setInterval(() => {
        if (previewCountdown.value > 1) {
            previewCountdown.value -= 1;
            return;
        }
        if (previewIntervalId !== null) {
            clearInterval(previewIntervalId);
            previewIntervalId = null;
        }
    }, 1000);

    setTimeout(() => {
        if (previewIntervalId !== null) {
            clearInterval(previewIntervalId);
            previewIntervalId = null;
        }
        cards.value = cards.value.map((card) => ({
            ...card,
            faceup: false,
        }));
        startTime.value = dayjs().valueOf();
        previewing.value = false;
    }, 3000);
};

onBeforeUnmount(() => {
    if (previewIntervalId !== null) {
        clearInterval(previewIntervalId);
        previewIntervalId = null;
    }
});

</script>

<template>
    <h1 class="title">Pick A-nimal</h1>
    <section class="buttons">
        <button class="gameStart" :disabled="previewing" v-on:click="onRestart">{{ startLabel }}</button>
    </section>
    <Score :flip-count="flipCount" :remained-match-count="remainedMatchCount"
        :session="session" :start-time="startTime" />
    <section class="boardWrap">
        <Transition name="toast-fade">
            <div v-if="previewing" class="previewToast">
                {{ previewCountdown }}초 뒤 뒤집힙니다. 외우세요!
            </div>
        </Transition>
        <TransitionGroup tag="section" class="board" name="shuffle-card">
            <div class='card' v-for="item in cards" :key="item.id" v-on:click="onCardClick(item.id)" v-bind:class="{
                faceup: item.faceup,
                facedown: !item.faceup,
            }" draggable="false">
                <div class="back"></div>
                <div class="front" draggable="false">
                    {{ item.value }}
                </div>
            </div>
        </TransitionGroup>
    </section>
    <section class="footer">
        <div class="footer-right">
            <div class="footer-controls">
                <Navigate href="/leaderboard">🏆 리더보드</Navigate>
                <slot name="footer-left"></slot>
            </div>
            <p class="battery">
                Powered by <i class="fab fa-vuejs">3</i> | 🧑‍🚀 <br />
                <a href="https://tigeryoo-portfolio.web.app/">🧑‍💻</a> |
                <a href="https://github.com/MTGVim/find-a-nimal"><i class="fab fa-github"></i></a>
            </p>
        </div>
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

.battery {
    font-size: 0.8rem;
    color: #34495E;
    text-align: right;
}

.battery .fa-vuejs {
    color: #41B883;
}

.card {
    aspect-ratio: 1 / 1.3;
    font-size: 3rem;
    max-height: 180px;
    position: relative;
    user-select: none;
    -webkit-user-select: none;
    -webkit-user-drag: none;
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
    user-select: none;
    -webkit-user-select: none;
    -webkit-user-drag: none;
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

.boardWrap {
    position: relative;
}

.previewToast {
    background: rgba(0, 0, 0, 0.45);
    border-radius: 999px;
    color: white;
    font-size: 0.9rem;
    font-weight: 700;
    left: 50%;
    padding: 0.35rem 0.8rem;
    pointer-events: none;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
    transition: opacity 0.2s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
    opacity: 0;
}

.score {
    margin-top: 1rem;
    text-align: center;
    font-size: small;
}

.buttons {
    margin-top: 1rem;
    padding-bottom: 8px;
    display: flex;
    flex-direction: row;
    justify-content: center;
}

.gameStart {
    background-color: #4CAF50;
    border-radius: 4px;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 1rem;
    padding: 0.35rem 0.75rem;
}

.gameStart:hover {
    background: darkgreen;
}

.gameStart:active {
    transform: scale(0.8);
}

.shuffle-card-move {
    transition: transform 0.4s ease-in;
}

.footer {
    align-items: flex-end;
    display: flex;
    justify-content: flex-end;
    padding: 0 8px 20px;
}

.footer-right {
    align-items: flex-end;
    display: flex;
    flex-direction: column;
}

.footer-controls {
    align-items: center;
    display: flex;
    gap: 6px;
    margin-bottom: 0.4rem;
    transform: translateY(16px);
}

</style>
