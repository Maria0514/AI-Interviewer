<template>
  <div class="page-container">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="floating-shape shape-1"></div>
      <div class="floating-shape shape-2"></div>
      <div class="floating-shape shape-3"></div>
    </div>

    <!-- 主要内容 -->
    <transition name="slide-up" appear>
      <el-card class="welcome-card main-card" shadow="hover">
        <div class="welcome-content">
          <!-- 头像和标题 -->
          <div class="header-section">
            <div class="avatar-container">
              <el-avatar :size="80" class="avatar">
                <el-icon size="40"><User /></el-icon>
              </el-avatar>
              <div class="avatar-ring"></div>
            </div>
            <h1 class="welcome-title">
              你好，我是 <span class="brand-name">Kora</span> 的语音面试官
            </h1>
          </div>

          <!-- 描述信息 -->
          <div class="description-section">
            <p class="description-text">
              接下来我会用中文向你提问一些常见面试问题，请用语音作答。
            </p>

            <!-- 功能特点 -->
            <div class="features">
              <div class="feature-item">
                <el-icon class="feature-icon"><Microphone /></el-icon>
                <span>语音识别</span>
              </div>
              <div class="feature-item">
                <el-icon class="feature-icon"><ChatDotRound /></el-icon>
                <span>智能对话</span>
              </div>
              <div class="feature-item">
                <el-icon class="feature-icon"><Document /></el-icon>
                <span>面试总结</span>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="action-section">
            <el-button
              type="primary"
              size="large"
              class="start-button"
              @click="startInterview"
              :loading="isStarting"
            >
              <el-icon class="button-icon"><VideoPlay /></el-icon>
              开始面试
            </el-button>

            <div class="tips">
              <el-icon><InfoFilled /></el-icon>
              <span>建议使用 Chrome 浏览器以获得最佳体验</span>
            </div>
          </div>
        </div>
      </el-card>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  User,
  Microphone,
  ChatDotRound,
  Document,
  VideoPlay,
  InfoFilled
} from '@element-plus/icons-vue';
import { useInterviewStore } from '../stores/interview.js';

const router = useRouter();
const interviewStore = useInterviewStore();
const isStarting = ref(false);

async function startInterview() {
  isStarting.value = true;

  try {
    // 重置之前的面试状态
    interviewStore.resetInterview();

    // 添加一个小延迟以显示加载状态
    await new Promise(resolve => setTimeout(resolve, 500));

    router.push('/interview');
  } catch (error) {
    console.error('启动面试失败:', error);
  } finally {
    isStarting.value = false;
  }
}
</script>

<style scoped>
.page-container {
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.floating-shape {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 100px;
  height: 100px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.shape-3 {
  width: 80px;
  height: 80px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

/* 欢迎卡片 */
.welcome-card {
  max-width: 500px;
  width: 100%;
  position: relative;
  z-index: 1;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
}

.welcome-content {
  padding: 40px 30px;
  text-align: center;
}

/* 头部区域 */
.header-section {
  margin-bottom: 30px;
}

.avatar-container {
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
}

.avatar {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: white;
  position: relative;
  z-index: 2;
}

.avatar-ring {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border: 2px solid var(--primary-color);
  border-radius: 50%;
  opacity: 0.3;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.1;
  }
  100% {
    transform: scale(1);
    opacity: 0.3;
  }
}

.welcome-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color-primary);
  margin: 0;
  line-height: 1.4;
}

.brand-name {
  color: var(--primary-color);
  font-weight: 700;
}

/* 描述区域 */
.description-section {
  margin-bottom: 30px;
}

.description-text {
  font-size: 16px;
  color: var(--text-color-regular);
  line-height: 1.6;
  margin-bottom: 25px;
}

.features {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-color-secondary);
  font-size: 14px;
}

.feature-icon {
  font-size: 24px;
  color: var(--primary-color);
  padding: 12px;
  background: rgba(64, 158, 255, 0.1);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.feature-item:hover .feature-icon {
  background: rgba(64, 158, 255, 0.2);
  transform: translateY(-2px);
}

/* 操作区域 */
.action-section {
  text-align: center;
}

.start-button {
  font-size: 16px;
  padding: 12px 30px;
  border-radius: 25px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  border: none;
  box-shadow: 0 4px 15px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
  margin-bottom: 15px;
}

.start-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
}

.button-icon {
  margin-right: 8px;
}

.tips {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-color-placeholder);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .welcome-content {
    padding: 30px 20px;
  }

  .welcome-title {
    font-size: 20px;
  }

  .features {
    gap: 20px;
  }

  .feature-item {
    font-size: 12px;
  }

  .feature-icon {
    font-size: 20px;
    padding: 10px;
  }
}
</style>
