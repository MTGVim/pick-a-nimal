<script setup lang="ts">
import { computed, ref } from 'vue';

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
};

</script>

<template>
    <h1 class="title">Pick A-nimal</h1>
    <section class="description">
        <p>카드 두 장을 선택해 뒤집으세요.<br /> 모든 쌍을 찾으세요! 💪 </p>
    </section>
    <section class="column">
        <Navigate href="/leaderboard">🏆 리더보드</Navigate>
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
    <Score :flip-count="flipCount" :remained-match-count="remainedMatchCount"
        :session="session" :start-time="startTime" />
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
    display: flex;
    flex-direction: row;
    justify-content: center;
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
    text-align: right;
    padding-right: 8px;
    padding-bottom: 20px;
}

</style>
