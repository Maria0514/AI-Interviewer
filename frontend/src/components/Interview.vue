
<template>
  <div class="page-container">
    <!-- 进度指示器 -->
    <div class="progress-container">
      <el-steps :active="current" finish-status="success" align-center>
        <el-step
          v-for="(question, index) in questions"
          :key="index"
          :title="`问题 ${index + 1}`"
        />
      </el-steps>
    </div>

    <!-- 主要内容 -->
    <transition name="slide-up" mode="out-in">
      <el-card class="interview-card main-card" shadow="hover" :key="current">
        <div class="interview-content">
          <!-- 头部信息 -->
          <div class="header-section">
            <div class="question-number">
              <el-icon><QuestionFilled /></el-icon>
              <span>第 {{ current + 1 }} 题 / 共 {{ questions.length }} 题</span>
            </div>
            <h2 class="interview-title">面试问答</h2>
          </div>

          <!-- 问题展示 -->
          <div class="question-section">
            <div class="question-card">
              <div class="question-icon">
                <el-icon><ChatDotRound /></el-icon>
              </div>
              <div class="question-content">
                <h3 class="question-label">面试官提问：</h3>
                <p class="question-text">{{ currentQuestion }}</p>
              </div>
            </div>
          </div>

          <!-- 录音控制 -->
          <div class="recording-section">
            <div class="recording-controls">
              <el-button
                type="primary"
                size="large"
                class="record-button"
                :class="{ 'recording': isRecording }"
                :loading="isRecording"
                @click="startRecognition"
                :disabled="isRecording"
              >
                <el-icon class="button-icon">
                  <Microphone v-if="!isRecording" />
                  <Loading v-else />
                </el-icon>
                {{ isRecording ? '正在录音中...' : '点击开始语音作答' }}
              </el-button>

              <el-button
                v-if="isRecording"
                type="danger"
                size="large"
                class="stop-button"
                @click="stopRecognition"
              >
                <el-icon><VideoPause /></el-icon>
                停止录音
              </el-button>
            </div>

            <!-- 录音状态指示 -->
            <div v-if="isRecording" class="recording-indicator">
              <div class="wave-animation">
                <div class="wave"></div>
                <div class="wave"></div>
                <div class="wave"></div>
              </div>
              <span class="recording-text">正在聆听您的回答...</span>
            </div>
          </div>

          <!-- 回答展示 -->
          <transition name="fade">
            <div v-if="answerText" class="answer-section">
              <div class="answer-card">
                <div class="answer-header">
                  <el-icon class="answer-icon"><User /></el-icon>
                  <span class="answer-label">您的回答：</span>
                </div>
                <div class="answer-content">
                  <el-input
                    type="textarea"
                    :model-value="answerText"
                    readonly
                    :autosize="{ minRows: 3, maxRows: 6 }"
                    class="answer-textarea"
                  />
                </div>
              </div>
            </div>
          </transition>

          <!-- 系统反馈 -->
          <transition name="fade">
            <div v-if="feedback" class="feedback-section">
              <el-alert
                :title="feedback"
                type="success"
                class="feedback-alert"
                show-icon
                :closable="false"
              >
                <template #default>
                  <div class="feedback-content">
                    <el-icon class="feedback-icon"><SuccessFilled /></el-icon>
                    <span>{{ feedback }}</span>
                  </div>
                </template>
              </el-alert>
            </div>
          </transition>

          <!-- 操作按钮 -->
          <div class="action-section">
            <el-button
              v-if="answerText && !isRecording"
              type="success"
              size="large"
              class="next-button"
              @click="nextQuestion"
            >
              <el-icon><ArrowRight /></el-icon>
              {{ current < questions.length - 1 ? '下一题' : '完成面试' }}
            </el-button>
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
  QuestionFilled,
  ChatDotRound,
  Microphone,
  Loading,
  VideoPause,
  User,
  SuccessFilled,
  ArrowRight
} from '@element-plus/icons-vue';

const questions = [
  '你最近完成的一件最有成就感的事是什么？你在其中扮演了什么角色？',
  '请讲讲一次你解决冲突或困难的经历。',
  '如果你加入一个你不熟悉的项目团队，你会如何快速融入？',
];
const feedbacks = [
  '明白了，谢谢你的回答。',
  '好的，能再详细说说你的具体做法吗？',
  '谢谢，接下来请听下一题。',
];

const current = ref(0);
const currentQuestion = ref(questions[current.value]);
const answerText = ref('');
const feedback = ref('');
const isRecording = ref(false);
let recognition = null;

// 记录所有问答
const records = ref([]);

const router = useRouter();

function startRecognition() {
  answerText.value = '';
  feedback.value = '';
  isRecording.value = true;
  if (!('webkitSpeechRecognition' in window)) {
    alert('当前浏览器不支持语音识别。请使用 Chrome 浏览器。');
    isRecording.value = false;
    return;
  }
  recognition = new window.webkitSpeechRecognition();
  recognition.lang = 'zh-CN';
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.onresult = (event) => {
    answerText.value = event.results[0][0].transcript;
    isRecording.value = false;
    // 简单模拟反馈
    feedback.value = feedbacks[Math.floor(Math.random() * feedbacks.length)];
  };
  recognition.onerror = () => {
    isRecording.value = false;
    feedback.value = '语音识别出错，请重试。';
  };
  recognition.onend = () => {
    isRecording.value = false;
  };
  recognition.start();
}

function stopRecognition() {
  if (recognition) {
    recognition.stop();
    isRecording.value = false;
  }
}

function nextQuestion() {
  // 保存当前问答
  records.value.push({
    question: currentQuestion.value,
    answer: answerText.value,
    feedback: feedback.value,
  });
  // 存储到 localStorage
  localStorage.setItem('interview_records', JSON.stringify(records.value));

  if (current.value < questions.length - 1) {
    current.value++;
    currentQuestion.value = questions[current.value];
    answerText.value = '';
    feedback.value = '';
  } else {
    router.push('/summary');
  }
}
</script>

<style scoped>
.page-container {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

/* 进度指示器 */
.progress-container {
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: var(--box-shadow-base);
}

/* 面试卡片 */
.interview-card {
  max-width: 100%;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
}

.interview-content {
  padding: 30px;
}

/* 头部区域 */
.header-section {
  text-align: center;
  margin-bottom: 30px;
}

.question-number {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--primary-color);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  margin-bottom: 15px;
}

.interview-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color-primary);
  margin: 0;
}

/* 问题区域 */
.question-section {
  margin-bottom: 30px;
}

.question-card {
  display: flex;
  gap: 15px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9ff, #e8f4ff);
  border-radius: 12px;
  border-left: 4px solid var(--primary-color);
}

.question-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.question-content {
  flex: 1;
}

.question-label {
  font-size: 14px;
  color: var(--text-color-secondary);
  margin: 0 0 8px 0;
  font-weight: 500;
}

.question-text {
  font-size: 16px;
  color: var(--text-color-primary);
  line-height: 1.6;
  margin: 0;
}

/* 录音区域 */
.recording-section {
  margin-bottom: 30px;
  text-align: center;
}

.recording-controls {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.record-button {
  padding: 15px 30px;
  border-radius: 25px;
  font-size: 16px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  border: none;
  box-shadow: 0 4px 15px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
}

.record-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
}

.record-button.recording {
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  animation: pulse-red 1.5s infinite;
}

@keyframes pulse-red {
  0%, 100% {
    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
  }
  50% {
    box-shadow: 0 6px 25px rgba(255, 107, 107, 0.6);
  }
}

.stop-button {
  padding: 15px 25px;
  border-radius: 25px;
  font-size: 16px;
}

.button-icon {
  margin-right: 8px;
}

/* 录音指示器 */
.recording-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.wave-animation {
  display: flex;
  gap: 4px;
}

.wave {
  width: 4px;
  height: 20px;
  background: var(--primary-color);
  border-radius: 2px;
  animation: wave 1.2s infinite ease-in-out;
}

.wave:nth-child(2) {
  animation-delay: 0.1s;
}

.wave:nth-child(3) {
  animation-delay: 0.2s;
}

@keyframes wave {
  0%, 40%, 100% {
    transform: scaleY(0.4);
  }
  20% {
    transform: scaleY(1);
  }
}

.recording-text {
  color: var(--text-color-secondary);
  font-size: 14px;
}

/* 回答区域 */
.answer-section {
  margin-bottom: 30px;
}

.answer-card {
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid var(--success-color);
}

.answer-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.answer-icon {
  color: var(--success-color);
  font-size: 18px;
}

.answer-label {
  font-size: 14px;
  color: var(--text-color-secondary);
  font-weight: 500;
}

.answer-content {
  margin-left: 28px;
}

.answer-textarea :deep(.el-textarea__inner) {
  background: white;
  border: 1px solid var(--border-color-light);
  border-radius: 8px;
  font-size: 15px;
  line-height: 1.6;
}

/* 反馈区域 */
.feedback-section {
  margin-bottom: 30px;
}

.feedback-alert {
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #f0f9ff, #e8f5e8);
}

.feedback-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.feedback-icon {
  color: var(--success-color);
}

/* 操作区域 */
.action-section {
  text-align: center;
}

.next-button {
  padding: 12px 30px;
  border-radius: 25px;
  font-size: 16px;
  background: linear-gradient(135deg, var(--success-color), #85ce61);
  border: none;
  box-shadow: 0 4px 15px rgba(103, 194, 58, 0.3);
  transition: all 0.3s ease;
}

.next-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(103, 194, 58, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-container {
    padding: 10px;
  }

  .interview-content {
    padding: 20px;
  }

  .question-card {
    flex-direction: column;
    text-align: center;
  }

  .recording-controls {
    flex-direction: column;
    align-items: center;
  }

  .record-button,
  .stop-button {
    width: 100%;
    max-width: 300px;
  }

  .answer-content {
    margin-left: 0;
  }
}
</style>
