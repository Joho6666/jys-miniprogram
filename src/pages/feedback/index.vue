<template><view class="page"><app-nav-bar title="意见反馈"/><view class="form"><textarea v-model="content" maxlength="1000" placeholder="请描述你遇到的问题或建议"/><input v-model="contact" placeholder="联系方式（选填）"/><button :loading="loading" :disabled="loading || !content.trim()" @tap="submit">提交反馈</button></view></view></template>
<script setup lang="ts">
import { ref } from 'vue';
import { submitFeedback } from '@/api/feedback';
const content = ref(''); const contact = ref(''); const loading = ref(false);
async function submit(): Promise<void> { if (!content.value.trim() || loading.value) return; loading.value = true; try { await submitFeedback(content.value.trim(), contact.value.trim() || undefined); uni.showToast({ title: '感谢你的反馈', icon: 'success' }); setTimeout(() => uni.navigateBack(), 500); } catch (error) { uni.showToast({ title: error instanceof Error ? error.message : '提交失败，请重试', icon: 'none' }); } finally { loading.value = false; } }
</script>
<style lang="scss" scoped>.page{min-height:100vh;background:$bg}.form{margin:24rpx 32rpx;padding:32rpx;background:$surface;border-radius:$radius-card}textarea{box-sizing:border-box;width:100%;height:320rpx;padding:24rpx;background:$bg;border-radius:$radius-input}input{margin-top:24rpx;padding:24rpx;background:$bg;border-radius:$radius-input}button{margin-top:32rpx;background:$primary;color:$white}</style>
