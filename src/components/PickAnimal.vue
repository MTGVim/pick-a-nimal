<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';

import dayjs from 'dayjs';
import _ from 'lodash';

import Navigate from './Navigate.vue';
import Score from './Score.vue';

const faceEmojiPresets = [
    ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'],
    ['🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐺'],
    ['🐗', '🐴', '🦄', '🐲', '🦝', '🐶', '🐱', '🦊'],
    ['🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸'],
    ['🐵', '🐺', '🐗', '🐴', '🦄', '🐲', '🦝', '🐰'],
    ['🐭', '🐹', '🐶', '🐱', '🐻', '🐼', '🐨', '🐯'],
    ['🦁', '🐮', '🐷', '🐸', '🐵', '🐺', '🐗', '🐴'],
    ['🦄', '🐲', '🦝', '🦊', '🐰', '🐭', '🐹', '🐶'],
] as const;

type GameMode = 'easy' | 'hard';

const HARD_PAIR_COUNT = 12;

const allFaceEmojis = Array.from(new Set(faceEmojiPresets.flatMap((preset) => preset)));

const pickRandomFacePreset = () => {
    const randomIndex = Math.floor(Math.random() * faceEmojiPresets.length);
    return [...faceEmojiPresets[randomIndex]];
};

const pickRandomFaceSetByMode = (mode: GameMode) => {
    if (mode === 'hard') {
        return _.sampleSize(allFaceEmojis, HARD_PAIR_COUNT);
    }
    return pickRandomFacePreset();
};

const createCards = (animals: string[]) => {
    return Array
        .from({ length: animals.length }, (_, i) => i)
        .flatMap((i) => {
            return [
                { id: i * 2, value: animals[i], faceup: true },
                { id: i * 2 + 1, value: animals[i], faceup: true },
            ];
        });
};

const gameMode = ref<GameMode>('easy');
const currentAnimals = ref(pickRandomFaceSetByMode(gameMode.value));

const started = ref(false);

const cards = ref(createCards(currentAnimals.value));

const selectedCards = ref<{ id: number, value: string, faceup: boolean }[]>([]);
const matchedIds = ref(new Set<number>());
const matchedFlashIds = ref(new Set<number>());
const mismatchIds = ref<number[]>([]);
const victoryThrowing = ref(false);
const victoryThrowStyleById = ref<Record<number, Record<string, string>>>({});

const startLabel = computed(() => {
    return started.value ? '다시 하기' : '시작 하기';
});
const isHardMode = computed(() => gameMode.value === 'hard');

const remainedMatchCount = computed(() => {
    return (cards.value.length - matchedIds.value.size) / 2;
});

const startTime = ref(dayjs().valueOf());
const flipCount = ref(0);
const previewing = ref(false);
const previewCountdown = ref(5);
let previewIntervalId: ReturnType<typeof setInterval> | null = null;
const pendingTimeoutIds: ReturnType<typeof setTimeout>[] = [];
const winAudio = typeof Audio === 'undefined'
    ? null
    : new Audio(`${import.meta.env.BASE_URL}sounds/ta-da.mp3`);

const playAudio = (audio: Audio | null, allowOverlap = false) => {
    if (!audio) {
        return;
    }

    const playable = allowOverlap ? audio.cloneNode() as Audio : audio;
    playable.currentTime = 0;
    void playable.play().catch(() => {
        // Ignore autoplay-related failures.
    });
};

const playWinAudio = () => {
    playAudio(winAudio);
};

const setManagedTimeout = (callback: () => void, ms: number) => {
    const timeoutId = setTimeout(() => {
        const index = pendingTimeoutIds.indexOf(timeoutId);
        if (index >= 0) {
            pendingTimeoutIds.splice(index, 1);
        }
        callback();
    }, ms);
    pendingTimeoutIds.push(timeoutId);
};

const triggerMatchedFlash = (...cardIds: number[]) => {
    cardIds.forEach((cardId) => matchedFlashIds.value.add(cardId));
    setManagedTimeout(() => {
        cardIds.forEach((cardId) => matchedFlashIds.value.delete(cardId));
    }, 420);
};

const triggerMismatchFeedback = (...cardIds: number[]) => {
    mismatchIds.value = Array.from(new Set([...mismatchIds.value, ...cardIds]));
    setManagedTimeout(() => {
        mismatchIds.value = mismatchIds.value.filter((cardId) => !cardIds.includes(cardId));
    }, 420);
};

const startVictoryThrowMotion = () => {
    victoryThrowing.value = true;
    const styles: Record<number, Record<string, string>> = {};
    cards.value.forEach((card, index) => {
        const horizontalDirection = index % 2 === 0 ? -1 : 1;
        const throwX = (40 + Math.random() * 140) * horizontalDirection;
        const throwRotate = (220 + Math.random() * 420) * horizontalDirection;
        const throwLift = 80 + Math.random() * 90;
        const throwDelay = Math.random() * 0.32;
        styles[card.id] = {
            '--throw-x': `${throwX}px`,
            '--throw-rotate': `${throwRotate}deg`,
            '--throw-lift': `${throwLift}px`,
            '--throw-delay': `${throwDelay}s`,
        };
    });
    victoryThrowStyleById.value = styles;
};

const resetBoardByMode = (mode: GameMode) => {
    selectedCards.value = [];
    matchedIds.value = new Set<number>();
    matchedFlashIds.value = new Set<number>();
    mismatchIds.value = [];
    victoryThrowing.value = false;
    victoryThrowStyleById.value = {};
    flipCount.value = 0;
    started.value = false;
    previewing.value = false;
    previewCountdown.value = 5;
    currentAnimals.value = pickRandomFaceSetByMode(mode);
    cards.value = _.shuffle(createCards(currentAnimals.value)).map((card) => ({
        ...card,
        faceup: true,
    }));
};

const onModeClick = (mode: GameMode) => {
    if (previewing.value || gameMode.value === mode) {
        return;
    }
    gameMode.value = mode;
    resetBoardByMode(mode);
};


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
            triggerMatchedFlash(firstCard.id, secondCard.id);
            selectedCards.value = [];

            if (matchedIds.value.size === cards.value.length) {
                playWinAudio();
                startVictoryThrowMotion();
            }
        }
        else {
            triggerMismatchFeedback(firstCard.id, secondCard.id);
            setManagedTimeout(() => {
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

    const isFirstStart = !started.value;

    selectedCards.value = [];
    matchedIds.value = new Set<number>();
    matchedFlashIds.value = new Set<number>();
    mismatchIds.value = [];
    victoryThrowing.value = false;
    victoryThrowStyleById.value = {};

    if (isFirstStart) {
        cards.value = _.shuffle(cards.value).map((card) => ({
            ...card,
            faceup: true,
        }));
    } else {
        currentAnimals.value = pickRandomFaceSetByMode(gameMode.value);
        cards.value = _.shuffle(createCards(currentAnimals.value)).map((card) => {
            card.faceup = true;
            return card;
        });
    }

    started.value = true;
    flipCount.value = 0;
    previewing.value = true;
    previewCountdown.value = 5;

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

    setManagedTimeout(() => {
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
    }, 5000);
};

onBeforeUnmount(() => {
    if (previewIntervalId !== null) {
        clearInterval(previewIntervalId);
        previewIntervalId = null;
    }
    pendingTimeoutIds.forEach((timeoutId) => clearTimeout(timeoutId));
    pendingTimeoutIds.length = 0;
});

</script>

<template>
    <h1 class="title">Pick A-nimal</h1>
    <section class="buttons">
        <button class="modeButton" :class="{ selected: !isHardMode }" :disabled="previewing" @click="onModeClick('easy')">쉬움 4x4</button>
        <button class="modeButton" :class="{ selected: isHardMode }" :disabled="previewing" @click="onModeClick('hard')">어려움 4x6</button>
    </section>
    <section class="buttons">
        <button class="gameStart" :disabled="previewing" v-on:click="onRestart">{{ startLabel }}</button>
    </section>
    <Score :flip-count="flipCount" :remained-match-count="remainedMatchCount" :start-time="startTime" :difficulty="gameMode" />
    <section class="boardWrap">
        <Transition name="toast-fade">
            <div v-if="previewing" class="previewToast">
                {{ previewCountdown }}초 뒤 뒤집힙니다.
            </div>
        </Transition>
        <TransitionGroup tag="section" class="board" :class="{ hard: isHardMode }" name="shuffle-card">
            <div class='card' v-for="item in cards" :key="item.id" v-on:click="onCardClick(item.id)" v-bind:class="{
                faceup: item.faceup,
                facedown: !item.faceup,
                matched: matchedIds.has(item.id),
                matchedFlash: matchedFlashIds.has(item.id),
                mismatch: mismatchIds.includes(item.id),
                victoryThrow: matchedIds.has(item.id) && victoryThrowing,
            }" :style="victoryThrowStyleById[item.id]" draggable="false">
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

.modeButton {
    border: solid 1px #d3d3d3;
    background-color: #fff;
    border-radius: 6px;
    color: #555;
    cursor: pointer;
    font-size: 0.85rem;
    padding: 0.3rem 0.55rem;
}

.buttons .modeButton + .modeButton {
    margin-left: 10px;
}

.modeButton.selected {
    border-color: #42b883;
    background-color: #e9fff6;
}

.card {
    aspect-ratio: 1 / 1.3;
    font-size: 3rem;
    max-height: 180px;
    position: relative;
    user-select: none;
    -webkit-user-select: none;
    -webkit-user-drag: none;
    transform-origin: center;
}

.card.matched .front {
    box-shadow: 0 0 0 2px #ffd966 inset;
}

.card.matchedFlash .front {
    animation: matched-pop 0.42s ease-out;
    box-shadow: 0 0 0 3px #ffea8a inset, 0 0 18px rgba(255, 214, 60, 0.8);
}

.card.victoryThrow {
    animation: victory-throw 1.25s cubic-bezier(0.18, 0.84, 0.34, 0.98) forwards;
    animation-delay: var(--throw-delay, 0s);
    pointer-events: none;
}

.card.mismatch {
    animation: mismatch-shake 0.42s ease-in-out;
}

.card.mismatch .front {
    box-shadow: 0 0 0 3px #ff6b6b inset, 0 0 14px rgba(255, 107, 107, 0.5);
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

.board.hard {
    gap: 8px;
    grid-template-columns: repeat(4, 1fr);
    max-width: 360px;
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

@keyframes matched-pop {
    0% {
        transform: scale(1);
    }
    35% {
        transform: scale(1.08);
    }
    100% {
        transform: scale(1);
    }
}

@keyframes victory-throw {
    0% {
        transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
        opacity: 1;
    }
    100% {
        transform: translate3d(var(--throw-x, 0), calc(-1 * var(--throw-lift, 100px)), 0) rotate(var(--throw-rotate, 360deg)) scale(0.2);
        opacity: 0;
    }
}

@keyframes mismatch-shake {
    0%, 100% {
        transform: translateX(0);
    }
    20% {
        transform: translateX(-6px) rotate(-1.5deg);
    }
    40% {
        transform: translateX(6px) rotate(1.5deg);
    }
    60% {
        transform: translateX(-4px) rotate(-1deg);
    }
    80% {
        transform: translateX(4px) rotate(1deg);
    }
}

</style>
