<script setup>
import { onMounted, ref } from 'vue';

import { supabase } from '../lib/supabase';
import Button from './Button.vue';
import PickAnimal from './PickAnimal.vue';

const loading = ref(false);
const email = ref('');
const message = ref('🔐 이메일로 링크를 보내 로그인 합니다.');
const session = ref(null);

onMounted(() => {
    supabase.auth.getSession().then(({ data }) => {
        session.value = data.session
        if(data.session.user) {
            handleUpdateUserName(data.session.user.email.split('@').at(0))
        }
    })

    supabase.auth.onAuthStateChange((_, _session) => {
        session.value = _session
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
    <section class="container">
        <form v-if="!session" class="column" @submit.prevent="handleSignin">
            <div class="guide">{{ message }}</div>
            <div class="row">
                <input class="inputField" required type="email" placeholder="Your email" v-model="email" />
                <input type="submit" class="button" :value="loading ? 'Loading...' : '링크 보내기'" :disabled="loading" />
            </div>
        </form>
        <div v-else class="row logged-in">
            👋 반가워요, {{ session.user.email.split('@').at(0) }}!
            <!-- <Button @click="handleUpdateUserName(session.user.email.split('@').at(0))" :disabled="loading">{{ loading ? 'Loading...' :
                '이름 변경'}}</Button> -->
            <Button @click="handleSignout" :disabled="loading">{{ loading ? 'Loading...' :
                '로그아웃'}}</Button>
        </div>
    </section>
    <PickAnimal :session="session" />
</template>

<style>
*:not(i) {
    font-family: "Noto Sans KR", serif;
    font-optical-sizing: auto;
    font-style: normal;
}

.container {
    position: sticky;
    top: 0;
    padding: 0.5rem;
    background-color: whitesmoke;
}

.guide {
    font-size: 14px;
    color: #666;
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
    width: 160px;
    border: 1px solid lightgray;
    padding: 0.2rem 0.4rem;
    border-radius: 5px;
}

.button {
    border: none;
    background-color: lightgray;
    border-radius: 4px;
    color: #555;
    cursor: pointer;
    font-size: smaller;
    padding: 0.2rem 0.4rem;
}
</style>