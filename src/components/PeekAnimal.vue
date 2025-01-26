<template>
    <h1 class="title">Peek A-nimal 🐯</h1>
    <section class="description">
        <p>카드 두 장을 선택해 뒤집으세요.<br/> 모든 쌍을 찾으세요! 💪</p>
    </section>
    <TransitionGroup tag="section" class="board" name="shuffle-card">
        <div
            class='card'
            v-for="item in cards"
            :key="item.id"
            v-on:click="onCardClick(item.id)"
            v-bind:class="{
                faceup: item.faceup,
                facedown: !item.faceup,
            }"
        >
            <div class="back"></div>
            <div class="front">
                {{ item.value }}
            </div>
        </div>
    </TransitionGroup>
    <section class="score">
        <p> 남은 매칭 수: {{ (cards.length - matchedIds.size)/2 }} </p>
    </section>
    <section class="footer">
        <button class="gameStart" v-on:click="onRestart">{{ startLabel }}</button>
        <p class="battery">powered by <i class="fab fa-vuejs">3</i>.</p>
    </section>
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
    
    if(card === undefined || card.faceup)
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
            setTimeout(() => {
                firstCard.faceup = false;
                secondCard.faceup = false;
            }, 1000);
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
    color:#34495E;
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
    max-height:180px;
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
    background-color:steelblue;
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
    max-width: 400px;
    padding: 0 24px;
}

.score {
    margin-top: 1rem;
    text-align: center;
}

.footer {
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
</style>
