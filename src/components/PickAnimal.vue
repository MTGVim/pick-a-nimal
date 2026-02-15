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
const victoryCelebrating = ref(false);
let victoryRepeatTimeoutId: ReturnType<typeof setTimeout> | null = null;
const mismatchAnimationMs = 560;
const mismatchFlipBackDelayMs = 760;

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

const clearManagedTimeouts = () => {
    pendingTimeoutIds.forEach((timeoutId) => clearTimeout(timeoutId));
    pendingTimeoutIds.length = 0;
};

const clearPreviewInterval = () => {
    if (previewIntervalId !== null) {
        clearInterval(previewIntervalId);
        previewIntervalId = null;
    }
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
    }, mismatchAnimationMs);
};

const clearVictoryFanLoop = () => {
    victoryCelebrating.value = false;
    if (victoryRepeatTimeoutId !== null) {
        clearTimeout(victoryRepeatTimeoutId);
        victoryRepeatTimeoutId = null;
    }
};

const startVictoryFanMotion = () => {
    clearVictoryFanLoop();
    victoryCelebrating.value = true;
    setManagedTimeout(() => {
        victoryCelebrating.value = false;
        if (started.value && matchedIds.value.size === cards.value.length) {
            if (victoryRepeatTimeoutId !== null) {
                clearTimeout(victoryRepeatTimeoutId);
            }
            victoryRepeatTimeoutId = setTimeout(() => {
                victoryRepeatTimeoutId = null;
                startVictoryFanMotion();
            }, 3000);
        }
    }, 1200);
};

const resetBoardByMode = (mode: GameMode) => {
    clearPreviewInterval();
    clearManagedTimeouts();
    selectedCards.value = [];
    matchedIds.value = new Set<number>();
    matchedFlashIds.value = new Set<number>();
    mismatchIds.value = [];
    clearVictoryFanLoop();
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
                startVictoryFanMotion();
            }
        }
        else {
            triggerMismatchFeedback(firstCard.id, secondCard.id);
            selectedCards.value = [];
            setManagedTimeout(() => {
                firstCard.faceup = false;
                secondCard.faceup = false;
            }, mismatchFlipBackDelayMs);
        }
    }
};

const onRestart = () => {
    clearPreviewInterval();
    clearManagedTimeouts();

    const isFirstStart = !started.value;

    selectedCards.value = [];
    matchedIds.value = new Set<number>();
    matchedFlashIds.value = new Set<number>();
    mismatchIds.value = [];
    clearVictoryFanLoop();

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

    previewIntervalId = setInterval(() => {
        if (previewCountdown.value > 1) {
            previewCountdown.value -= 1;
            return;
        }
        clearPreviewInterval();
    }, 1000);

    setManagedTimeout(() => {
        clearPreviewInterval();
        cards.value = cards.value.map((card) => ({
            ...card,
            faceup: false,
        }));
        startTime.value = dayjs().valueOf();
        previewing.value = false;
    }, 5000);
};

onBeforeUnmount(() => {
    clearVictoryFanLoop();
    clearPreviewInterval();
    clearManagedTimeouts();
});

</script>

<template>
    <h1 class="title">Pick A-nimal</h1>
    <section class="buttons">
        <button class="modeButton" :class="{ selected: !isHardMode }" :disabled="previewing" @click="onModeClick('easy')">쉬움 4x4</button>
        <button class="modeButton" :class="{ selected: isHardMode }" :disabled="previewing" @click="onModeClick('hard')">어려움 4x6</button>
    </section>
    <section class="buttons">
        <button class="gameStart" v-on:click="onRestart">{{ startLabel }}</button>
    </section>
    <section class="boardWrap">
        <Transition name="toast-fade">
            <div v-if="previewing" class="previewToast">
                {{ previewCountdown }}
            </div>
        </Transition>
        <TransitionGroup tag="section" class="board" :class="{ hard: isHardMode }" name="shuffle-card">
            <div class='card' v-for="item in cards" :key="item.id" v-on:click="onCardClick(item.id)" v-bind:class="{
                faceup: item.faceup,
                facedown: !item.faceup,
                matched: matchedIds.has(item.id),
                matchedFlash: matchedFlashIds.has(item.id),
                mismatch: mismatchIds.includes(item.id),
                victoryCelebrate: matchedIds.has(item.id) && victoryCelebrating,
            }" draggable="false">
                <div class="back"></div>
                <div class="front" draggable="false">
                    {{ item.value }}
                </div>
            </div>
        </TransitionGroup>
    </section>
    <Score :flip-count="flipCount" :remained-match-count="remainedMatchCount" :start-time="startTime" :difficulty="gameMode" />
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
    box-shadow: 0 0 0 3px #b8efb3 inset;
}

.card.matchedFlash .front {
    animation: matched-pop 0.42s ease-out;
    box-shadow: 0 0 0 4px #c8f6c4 inset, 0 0 18px rgba(146, 224, 136, 0.7);
}

.card.mismatch {
    animation: mismatch-shake 0.56s ease-in-out;
}

.card.mismatch .front {
    box-shadow: 0 0 0 4px #ff6b6b inset, 0 0 14px rgba(255, 107, 107, 0.5);
}

.card.victoryCelebrate {
    animation: victory-sway 1.2s ease-in-out both;
    transform-origin: center;
    z-index: 2;
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
    font-size: 1.2rem;
    font-weight: 800;
    left: 50%;
    min-width: 2.2rem;
    padding: 0.25rem 0.7rem;
    pointer-events: none;
    position: absolute;
    text-align: center;
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

@keyframes mismatch-shake {
    0%, 100% {
        translate: 0 0;
    }
    20% {
        translate: -7px 0;
    }
    40% {
        translate: 7px 0;
    }
    60% {
        translate: -5px 0;
    }
    80% {
        translate: 5px 0;
    }
}

@keyframes victory-sway {
    0% {
        transform: translateX(0) rotate(0deg) scale(1);
    }
    20% {
        transform: translateX(-3px) rotate(-2deg) scale(1.05);
    }
    50% {
        transform: translateX(3px) rotate(2deg) scale(1.03);
    }
    80% {
        transform: translateX(-2px) rotate(-1.2deg) scale(1.04);
    }
    100% {
        transform: translateX(0) rotate(0deg) scale(1);
    }
}

</style>
