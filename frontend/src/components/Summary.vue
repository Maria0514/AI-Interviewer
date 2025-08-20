<template>
  <div class="page-container">
    <!-- 头部区域 -->
    <div class="header-section">
      <transition name="slide-up" appear>
        <div class="completion-badge">
          <el-icon class="completion-icon"><SuccessFilled /></el-icon>
          <h1 class="completion-title">面试完成！</h1>
          <p class="completion-subtitle">感谢您参与本次面试，以下是您的面试记录</p>
        </div>
      </transition>
    </div>

    <!-- 统计信息 -->
    <transition name="slide-up" appear :delay="200">
      <div class="stats-section">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-card class="stat-card" shadow="hover">
              <div class="stat-content">
                <el-icon class="stat-icon questions-icon"><QuestionFilled /></el-icon>
                <div class="stat-info">
                  <div class="stat-number">{{ records.length }}</div>
                  <div class="stat-label">问题总数</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="stat-card" shadow="hover">
              <div class="stat-content">
                <el-icon class="stat-icon time-icon"><Timer /></el-icon>
                <div class="stat-info">
                  <div class="stat-number">{{ totalWords }}</div>
                  <div class="stat-label">回答字数</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="stat-card" shadow="hover">
              <div class="stat-content">
                <el-icon class="stat-icon score-icon"><TrophyBase /></el-icon>
                <div class="stat-info">
                  <div class="stat-number">优秀</div>
                  <div class="stat-label">整体评价</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </transition>

    <!-- 面试记录 -->
    <transition name="slide-up" appear :delay="400">
      <el-card class="summary-card main-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon"><Document /></el-icon>
            <span class="header-title">详细面试记录</span>
          </div>
        </template>

        <div class="records-container">
          <div
            v-for="(record, index) in records"
            :key="index"
            class="record-item"
          >
            <!-- 问题 -->
            <div class="question-block">
              <div class="block-header">
                <el-tag type="info" size="small" class="question-tag">
                  问题 {{ index + 1 }}
                </el-tag>
              </div>
              <div class="block-content">
                <el-icon class="content-icon"><ChatDotRound /></el-icon>
                <p class="content-text">{{ record.question }}</p>
              </div>
            </div>

            <!-- 回答 -->
            <div class="answer-block">
              <div class="block-header">
                <el-tag type="success" size="small" class="answer-tag">
                  您的回答
                </el-tag>
              </div>
              <div class="block-content">
                <el-icon class="content-icon"><User /></el-icon>
                <p class="content-text">{{ record.answer || '未回答' }}</p>
              </div>
            </div>

            <!-- 反馈 -->
            <div v-if="record.feedback" class="feedback-block">
              <div class="block-header">
                <el-tag type="warning" size="small" class="feedback-tag">
                  系统反馈
                </el-tag>
              </div>
              <div class="block-content">
                <el-icon class="content-icon"><MessageBox /></el-icon>
                <p class="content-text">{{ record.feedback }}</p>
              </div>
            </div>

            <el-divider v-if="index < records.length - 1" />
          </div>
        </div>

        <!-- 空状态 -->
        <el-empty
          v-if="records.length === 0"
          description="暂无面试记录"
          :image-size="120"
        />
      </el-card>
    </transition>

    <!-- 操作按钮 -->
    <transition name="slide-up" appear :delay="600">
      <div class="action-section">
        <el-button
          type="primary"
          size="large"
          class="action-button"
          @click="downloadRecord"
        >
          <el-icon><Download /></el-icon>
          下载记录
        </el-button>

        <el-button
          type="success"
          size="large"
          class="action-button"
          @click="restart"
        >
          <el-icon><RefreshRight /></el-icon>
          重新开始
        </el-button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { onMounted, ref, computed } from 'vue';
import {
  SuccessFilled,
  QuestionFilled,
  Timer,
  TrophyBase,
  Document,
  ChatDotRound,
  User,
  MessageBox,
  Download,
  RefreshRight
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const router = useRouter();
const records = ref([]);

// 计算总字数
const totalWords = computed(() => {
  return records.value.reduce((total, record) => {
    return total + (record.answer ? record.answer.length : 0);
  }, 0);
});

onMounted(() => {
  // 从 localStorage 获取问答记录
  const data = localStorage.getItem('interview_records');
  if (data) {
    try {
      records.value = JSON.parse(data);
    } catch (error) {
      console.error('解析面试记录失败:', error);
      records.value = [];
    }
  }
});

function downloadRecord() {
  if (records.value.length === 0) {
    ElMessage.warning('暂无面试记录可下载');
    return;
  }

  const content = JSON.stringify(records.value, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `面试记录_${new Date().toLocaleDateString()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  ElMessage.success('面试记录已下载');
}

function restart() {
  localStorage.removeItem('interview_records');
  router.push('/');
}
</script>

<style scoped>
.page-container {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

/* 头部区域 */
.header-section {
  text-align: center;
  margin-bottom: 30px;
}

.completion-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 30px;
  border-radius: 20px;
  box-shadow: var(--box-shadow-light);
}

.completion-icon {
  font-size: 48px;
  margin-bottom: 15px;
  color: #4ade80;
}

.completion-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 10px 0;
}

.completion-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

/* 统计区域 */
.stats-section {
  margin-bottom: 30px;
}

.stat-card {
  border: none;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--box-shadow-light);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
}

.stat-icon {
  font-size: 32px;
  padding: 12px;
  border-radius: 12px;
  color: white;
}

.questions-icon {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
}

.time-icon {
  background: linear-gradient(135deg, var(--warning-color), #f7ba2a);
}

.score-icon {
  background: linear-gradient(135deg, var(--success-color), #85ce61);
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-color-primary);
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: var(--text-color-secondary);
  margin-top: 4px;
}

/* 总结卡片 */
.summary-card {
  border: none;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  margin-bottom: 30px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color-primary);
}

.header-icon {
  font-size: 20px;
  color: var(--primary-color);
}

/* 记录容器 */
.records-container {
  max-height: 600px;
  overflow-y: auto;
  padding-right: 10px;
}

.record-item {
  margin-bottom: 25px;
}

.record-item:last-child {
  margin-bottom: 0;
}

/* 块样式 */
.question-block,
.answer-block,
.feedback-block {
  margin-bottom: 15px;
}

.block-header {
  margin-bottom: 8px;
}

.question-tag {
  background: var(--primary-color);
  color: white;
  border: none;
}

.answer-tag {
  background: var(--success-color);
  color: white;
  border: none;
}

.feedback-tag {
  background: var(--warning-color);
  color: white;
  border: none;
}

.block-content {
  display: flex;
  gap: 12px;
  padding: 15px;
  border-radius: 8px;
  background: var(--bg-color);
  border-left: 3px solid transparent;
}

.question-block .block-content {
  border-left-color: var(--primary-color);
  background: linear-gradient(135deg, #f8f9ff, #e8f4ff);
}

.answer-block .block-content {
  border-left-color: var(--success-color);
  background: linear-gradient(135deg, #f0f9ff, #e8f5e8);
}

.feedback-block .block-content {
  border-left-color: var(--warning-color);
  background: linear-gradient(135deg, #fffbf0, #fef3e8);
}

.content-icon {
  flex-shrink: 0;
  font-size: 18px;
  margin-top: 2px;
}

.question-block .content-icon {
  color: var(--primary-color);
}

.answer-block .content-icon {
  color: var(--success-color);
}

.feedback-block .content-icon {
  color: var(--warning-color);
}

.content-text {
  flex: 1;
  margin: 0;
  line-height: 1.6;
  color: var(--text-color-primary);
  font-size: 15px;
}

/* 操作区域 */
.action-section {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.action-button {
  padding: 12px 30px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.action-button:hover {
  transform: translateY(-2px);
}

/* 动画 */
.slide-up-enter-active {
  transition: all 0.6s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-container {
    padding: 10px;
  }

  .completion-badge {
    padding: 30px 20px;
  }

  .completion-title {
    font-size: 24px;
  }

  .stat-content {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }

  .stat-icon {
    font-size: 28px;
  }

  .stat-number {
    font-size: 20px;
  }

  .block-content {
    flex-direction: column;
    gap: 8px;
  }

  .content-icon {
    align-self: flex-start;
  }

  .action-section {
    flex-direction: column;
    align-items: center;
  }

  .action-button {
    width: 100%;
    max-width: 300px;
  }
}
</style>
