<script setup>
import { onMounted, ref } from 'vue';

import { supabase } from '../libs/supabase';
import PickAnimal from './PickAnimal.vue';

const loading = ref(false);
const email = ref('');
const message = ref('🔐 이메일로 로그인합니다.');
const session = ref(null);
const showAuthModal = ref(false);

onMounted(() => {
    supabase.auth.getSession().then(({ data }) => {
        session.value = data.session
    })

    supabase.auth.onAuthStateChange((_, sessonValue) => {
        session.value = sessonValue
        if(sessonValue?.user?.email) {
            handleUpdateUserName(sessonValue.user.email.split('@').at(0))
        }
    })
});

const handleSignin = async () => {
    try {
        loading.value = true
        const { error } = await supabase.auth.signInWithOtp({
            email: email.value,
        })
        if (error) throw error
        message.value = '✅ 메일함을 확인하고, 로그인하세요!'
    } catch (error) {
        if (error instanceof Error) {
            message.value = error.message
        }
    } finally {
        loading.value = false
    }
};

const handleSignout = async () => {
    try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
    } catch (error) {
        console.error('Sign out error', error)
    }
};

const handleUpdateUserName = async (username) => {
    try {
    const { error } = await supabase
        .from('profiles')  // 'users' 테이블
        .update({ username })  // 새로운 username
        .eq('id', session.value.user.id);  // 현재 로그인한 사용자의 ID로 업데이트

        if (error) throw error

    } catch (error) {
        console.error('Update user name error', error)
    }
};

</script>

<template>
    <PickAnimal :session="session">
        <template #footer-left>
            <button class="loginTrigger" @click="showAuthModal = true">
                {{ session ? '계정' : '로그인' }}
            </button>
        </template>
    </PickAnimal>

    <section v-if="showAuthModal" class="modalBackdrop" @click.self="showAuthModal = false">
        <div v-bind:class="{
            'modalBody': true,
            'logged-in': session,
            'not-logged-in': !session,
        }">
            <button class="closeButton" @click="showAuthModal = false">닫기</button>
            <form v-if="!session" class="column" @submit.prevent="handleSignin">
                <div class="guide">{{ message }}</div>
                <div class="row">
                    <input class="inputField" required type="email" placeholder="Your email" v-model="email" />
                    <input type="submit" class="actionButton" :value="loading ? 'Loading...' : '링크 보내기'" :disabled="loading" />
                </div>
            </form>
            <div v-else class="column">
                <div class="guide">👋 반가워요, {{ session.user.email.split('@').at(0) }}!</div>
                <button class="actionButton" @click="handleSignout" :disabled="loading">
                    {{ loading ? 'Loading...' : '로그아웃' }}
                </button>
            </div>
        </div>
    </section>
</template>

<style>
*:not(i) {
    font-family: "Noto Sans KR", serif;
    font-optical-sizing: auto;
    font-style: normal;
}

.loginTrigger {
    border: solid 1px lightgray;
    background-color: white;
    border-radius: 4px;
    color: #555;
    cursor: pointer;
    font-size: 0.75rem;
    padding: 0.2rem 0.45rem;
    transition: all 0.2s ease-in-out;
}

.loginTrigger:hover {
    background: #eaf2ff;
}

.modalBackdrop {
    align-items: center;
    background-color: rgba(0, 0, 0, 0.35);
    display: flex;
    inset: 0;
    justify-content: center;
    position: fixed;
    z-index: 10;
}

.modalBody {
    border-radius: 10px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    max-width: 360px;
    padding: 1rem;
    width: calc(100% - 24px);
}

.modalBody.not-logged-in {
    background-color: azure;
}

.modalBody.logged-in {
    background-color: whitesmoke;
}

.closeButton {
    background: transparent;
    border: none;
    color: #666;
    cursor: pointer;
    display: block;
    font-size: 0.8rem;
    margin-left: auto;
    margin-bottom: 0.5rem;
}

.guide {
    font-size: 14px;
    color: #444;
    margin-bottom: 0.4rem;
}

.column {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.row {
    align-items: center;
    display: flex;
    flex-direction: row;
    gap: 4px;
    justify-content: center;
}

.inputField {
    width: 190px;
    border: 1px solid lightgray;
    padding: 0.2rem 0.4rem;
    border-radius: 5px;
}

.actionButton {
    border: none;
    background-color: lightgray;
    border-radius: 4px;
    color: #555;
    cursor: pointer;
    font-size: 0.8rem;
    padding: 0.2rem 0.4rem;
}
</style>
