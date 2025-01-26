<template>
    <h1 class="title">Peek A-nimal 🃏</h1>
    <section class="description">
        <p>카드 두 장을 선택해 뒤집으세요.<br/> 모든 쌍을 찾으세요! 💪</p>
        <p class="battery">powered by <i class="fab fa-vuejs">3</i>.</p>
    </section>
    <section class="board">
        <div
            class='card'
            v-bind:class="{
                faceup: item.faceup,
                facedown: !item.faceup,
                matched: matchedIds.has(item.id)
            }"
            v-for="item in cards"
            :key="item.id"
            v-on:click="onCardClick(item.id)"
        >
            {{ item.faceup ? item.value : item.id }}
        </div>
    </section>
    <section class="score">
        <p> 남은 매칭 수: {{ (cards.length - matchedIds.size)/2 }} </p>
    </section>
    <section class="footer">
        <button class="gameStart" v-on:click="onRestart">{{ startLabel }}</button>
    </section>
    {{ matchedIds }}
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import _ from 'lodash';

const animals = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'] as const;

const started = ref(false);

const cards = ref(
    Array
    .from({ length: animals.length }, (_, i) => i)
    .flatMap((i) => {
        return [
            { id: i * 2, value: animals[i], faceup: false },
            { id: i * 2 + 1, value: animals[i], faceup: true },
        ];
    })
);

const selectedCards = ref<{id: number, value: typeof animals[number], faceup: boolean}[]>([]);
const matchedIds = ref(new Set<number>());

const startLabel = computed(() => {
    return started.value ? '다시 하기' : '시작 하기';
});

const onCardClick = (cardId: number) => {

    const card = cards.value.find(card => card.id === cardId);
    
    if(card === undefined)
        return;

    card.faceup = true;

    selectedCards.value.push(card);

    if(selectedCards.value.length >= 2) {
        const [first, second] = selectedCards.value;
        const firstCard = cards.value.find(card => card.id === first.id)!;
        const secondCard = cards.value.find(card => card.id === second.id)!;
        if(firstCard?.value === secondCard?.value) {
            matchedIds.value.add(firstCard?.id);
            matchedIds.value.add(secondCard?.id);
        }
        else {
            firstCard.faceup = false;
            secondCard.faceup = false;
        }
        selectedCards.value = [];
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
};

</script>

<style scoped>
.title {
    font-size: 2rem;
    margin-bottom: 1rem;
    text-align: center;
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
    align-items: center;
    aspect-ratio: 1 / 1.3;
    border: solid 1px gray;
    border-radius: 8px;
    display: flex;
    font-size: 3rem;
    justify-content: center;
}

.card.facedown {
    background-color:burlywood;
}

.card.faceup {
    background-color: beige;
}

.card.matched {
    background-color: #2ECC71;
}

.board {
    align-items: center;
    display: grid;
    gap: 8px;
    grid-template-columns: 20% 20% 20% 20%;
    justify-content: center;
    padding: 0 10%;
}

.score {
    margin-top: 1rem;
    text-align: center;
}

.footer {
    margin-top: 1rem;
    text-align: center;
}

.gameStart {
    background-color: #4CAF50;
    border-radius: 5px;
    border: none;
    color: white;
    cursor: pointer;
    padding: 0.5rem 1rem;
}
</style>
