<template>
    <button :type="type" @click="onClick">
        <slot></slot>
    </button>
</template>

<script setup>
defineProps({
    onClick: {
        type: Function,
        default: () => { },
    },
});
</script>

<style scoped>
button {
    border: solid 1px lightgray;
    background-color: white;
    border-radius: 4px;
    color: #555;
    cursor: pointer;
    font-size: smaller;
    padding: 0.2rem 0.4rem;
    transition: all 0.3s ease-in-out;
}

button:hover {
    background: #dbeafe;
}

button:active {
    transform: scale(0.8);
}
</style>