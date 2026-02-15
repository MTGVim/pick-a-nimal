<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
    color: {
        type: String,
        default: 'blue',
    },
    href: {
        type: String,
        default: '/',
    }
});

const resolvedHref = computed(() => {
    const href = props.href;

    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('#')) {
        return href;
    }

    const baseUrl = import.meta.env.BASE_URL;

    if (href.startsWith('/')) {
        return `${baseUrl.replace(/\/$/, '')}${href}`;
    }

    return `${baseUrl}${href}`;
});
</script>

<template>
    <a :href="resolvedHref" class="custom-link">
        <slot></slot>
    </a>
</template>

<style scoped>
a {
    display: inline-block;
    border: none;
    background-color: white;
    border-radius: 4px;
    color: #555;
    cursor: pointer;
    font-size: smaller;
    padding: 0.2rem 0.4rem;
    text-decoration: none;
    transition: all 0.3s ease-in-out;
    text-align: center;
}

/* 호버 시 배경 변경 */
a:hover {
    background-color:lightblue;
    color: #555;
}

/* 클릭 시 크기 축소 */
a:active {
    transform: scale(0.8);
}

/* 비활성화 스타일 */
a.disabled {
    pointer-events: none;
    opacity: 0.6;
    border-color: #d1d5db;
    background: #f3f4f6;
    color: #9ca3af;
}

/* 아이콘이 포함된 링크 */
a .icon {
    margin-right: 4px;
    vertical-align: middle;
    fill: currentColor;
}
</style>
