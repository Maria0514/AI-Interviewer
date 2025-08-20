
<template>
  <div class="page-container">
    <!-- 进度指示器 -->
    <div class="progress-container">
      <el-steps :active="interviewStore.currentQuestionIndex" finish-status="success" align-center>
        <el-step
          v-for="(question, index) in interviewStore.questions"
          :key="index"
          :title="`问题 ${index + 1}`"
        />
      </el-steps>
    </div>

    <!-- 主要内容 -->
    <transition name="slide-up" mode="out-in">
      <el-card class="interview-card main-card" shadow="hover" :key="interviewStore.currentQuestionIndex">
        <div class="interview-content">
          <!-- 头部信息 -->
          <div class="header-section">
            <div class="question-number">
              <el-icon><QuestionFilled /></el-icon>
              <span>第 {{ interviewStore.currentQuestionIndex + 1 }} 题 / 共 {{ interviewStore.totalQuestions }} 题</span>
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
                <h3 class="question-label">
                  {{ isFollowUp ? '面试官追问：' : '面试官提问：' }}
                </h3>
                <p class="question-text">{{ displayQuestion }}</p>
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
                :disabled="isRecording || isSubmitting"
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

            <!-- 手动输入提示 -->
            <div v-if="!isRecording" class="manual-input-tip">
              <el-text type="info" size="small">
                <el-icon><User /></el-icon>
                也可以直接在下方文本框中输入回答
              </el-text>
            </div>
          </div>

          <!-- 回答输入 -->
          <div class="answer-section">
            <div class="answer-card">
              <div class="answer-header">
                <el-icon class="answer-icon"><User /></el-icon>
                <span class="answer-label">您的回答：</span>
              </div>
              <div class="answer-content">
                <el-input
                  v-model="answerText"
                  type="textarea"
                  :placeholder="isRecording ? '正在录音，请说话...' : '请输入您的回答或使用语音输入'"
                  :autosize="{ minRows: 4, maxRows: 8 }"
                  class="answer-textarea"
                  :disabled="isRecording || isSubmitting"
                  maxlength="1000"
                  show-word-limit
                />
              </div>
            </div>
          </div>

          <!-- 系统反馈 -->
          <transition name="fade">
            <div v-if="currentFeedback && !isFollowUp" class="feedback-section">
              <el-alert
                :title="currentFeedback"
                type="success"
                class="feedback-alert"
                show-icon
                :closable="false"
              />
            </div>
          </transition>

          <!-- 操作按钮 -->
          <div class="action-section">
            <el-button
              v-if="canSubmit"
              type="success"
              size="large"
              class="submit-button"
              :loading="isSubmitting"
              @click="submitAnswer"
            >
              <el-icon v-if="!isSubmitting"><ArrowRight /></el-icon>
              {{ isSubmitting ? '正在分析...' : (isFollowUp ? '提交追问回答' : '提交回答') }}
            </el-button>

            <el-text v-if="!canSubmit && !isRecording" type="info" size="small">
              请先输入回答内容
            </el-text>
          </div>
        </div>
      </el-card>
    </transition>
  </div>
</template>


<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElLoading } from 'element-plus';
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
import { useInterviewStore } from '../stores/interview.js';

const router = useRouter();
const interviewStore = useInterviewStore();

// 组件状态
const answerText = ref('');
const isRecording = ref(false);
const isSubmitting = ref(false);
const isFollowUp = ref(false);
const currentFeedback = ref('');
let recognition = null;
let loadingInstance = null;

// 计算属性
const displayQuestion = computed(() => {
  if (isFollowUp.value && currentFeedback.value) {
    return currentFeedback.value;
  }
  return interviewStore.currentQuestion;
});

const canSubmit = computed(() => {
  return answerText.value.trim().length > 0 && !isRecording.value && !isSubmitting.value;
});

// 生命周期
onMounted(async () => {
  // 如果没有活跃的面试会话，启动新的面试
  if (!interviewStore.isInterviewActive) {
    try {
      loadingInstance = ElLoading.service({
        lock: true,
        text: '正在初始化面试...',
        background: 'rgba(0, 0, 0, 0.7)',
      });

      await interviewStore.startInterview({
        interviewStyle: 'professional',
        candidateName: '面试者',
      });

      ElMessage.success('面试已开始，请回答第一个问题');
    } catch (error) {
      ElMessage.error('启动面试失败，请重试');
      router.push('/');
    } finally {
      if (loadingInstance) {
        loadingInstance.close();
      }
    }
  }
});

onUnmounted(() => {
  if (recognition) {
    recognition.stop();
  }
  if (loadingInstance) {
    loadingInstance.close();
  }
});

// 语音识别方法
function startRecognition() {
  answerText.value = '';
  isRecording.value = true;

  if (!('webkitSpeechRecognition' in window)) {
    ElMessage.warning('当前浏览器不支持语音识别，请使用 Chrome 浏览器或手动输入回答');
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
    ElMessage.success('语音识别完成');
  };

  recognition.onerror = (event) => {
    isRecording.value = false;
    console.error('语音识别错误:', event.error);
    ElMessage.error('语音识别失败，请重试或手动输入');
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

// 提交回答
async function submitAnswer() {
  if (!canSubmit.value) return;

  isSubmitting.value = true;

  try {
    loadingInstance = ElLoading.service({
      lock: true,
      text: '正在分析您的回答...',
      background: 'rgba(0, 0, 0, 0.7)',
    });

    let result;
    if (isFollowUp.value) {
      result = await interviewStore.submitFollowUpAnswer(answerText.value);
    } else {
      result = await interviewStore.submitAnswer(answerText.value);
    }

    // 处理AI反馈
    if (result.action === 'follow_up') {
      // 追问
      isFollowUp.value = true;
      currentFeedback.value = result.feedback;
      answerText.value = '';
      ElMessage.info('面试官有追问，请继续回答');
    } else if (result.action === 'next_question') {
      // 下一题
      isFollowUp.value = false;
      currentFeedback.value = '';
      answerText.value = '';
      ElMessage.success('回答完成，进入下一题');
    } else if (result.action === 'interview_complete') {
      // 面试结束
      ElMessage.success('面试完成！正在跳转到总结页面...');
      setTimeout(() => {
        router.push('/summary');
      }, 1500);
    }

  } catch (error) {
    ElMessage.error('提交失败，请重试');
    console.error('提交回答失败:', error);
  } finally {
    isSubmitting.value = false;
    if (loadingInstance) {
      loadingInstance.close();
    }
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

/* 手动输入提示 */
.manual-input-tip {
  margin-top: 15px;
  text-align: center;
}

.manual-input-tip .el-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.submit-button {
  padding: 12px 30px;
  border-radius: 25px;
  font-size: 16px;
  background: linear-gradient(135deg, var(--success-color), #85ce61);
  border: none;
  box-shadow: 0 4px 15px rgba(103, 194, 58, 0.3);
  transition: all 0.3s ease;
  min-width: 160px;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(103, 194, 58, 0.4);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
