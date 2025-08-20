import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { analyzeAnswer } from '../services/api.js';

export const useInterviewStore = defineStore('interview', () => {
  // 状态
  const sessionId = ref('');
  const currentQuestionIndex = ref(0);
  const questions = ref([
    '你最近完成的一件最有成就感的事是什么？你在其中扮演了什么角色？',
    '请讲讲一次你解决冲突或困难的经历。',
    '如果你加入一个你不熟悉的项目团队，你会如何快速融入？',
  ]);
  const currentQuestion = ref('');
  const interviewRecords = ref([]);
  const isInterviewActive = ref(false);
  const interviewStyle = ref('professional');
  const candidateName = ref('面试者');
  
  // 当前问答记录
  const currentRecord = ref({
    questionIndex: 0,
    question: '',
    answer: '',
    followUps: [],
    feedback: '',
    analysis: null,
  });

  // 计算属性
  const totalQuestions = computed(() => questions.value.length);
  const isLastQuestion = computed(() => currentQuestionIndex.value >= totalQuestions.value - 1);
  const progress = computed(() => ((currentQuestionIndex.value + 1) / totalQuestions.value) * 100);

  // 方法
  const startInterview = async (params = {}) => {
    try {
      // 前端直接管理面试会话，无需后端接口
      sessionId.value = `session_${Date.now()}`;
      currentQuestion.value = questions.value[0];
      currentQuestionIndex.value = 0;
      interviewRecords.value = [];
      isInterviewActive.value = true;
      interviewStyle.value = params.interviewStyle || 'professional';
      candidateName.value = params.candidateName || '面试者';

      // 初始化当前记录
      currentRecord.value = {
        questionIndex: 0,
        question: currentQuestion.value,
        answer: '',
        followUps: [],
        feedback: '',
        analysis: null,
      };

      return {
        sessionId: sessionId.value,
        firstQuestion: currentQuestion.value,
        totalQuestions: questions.value.length,
      };
    } catch (error) {
      console.error('开始面试失败:', error);
      throw error;
    }
  };

  const submitAnswer = async (answer) => {
    try {
      // 调用后端分析接口
      const response = await analyzeAnswer(currentQuestion.value, answer);

      if (response.success) {
        const { needFollowUp, feedback } = response.data;

        // 更新当前记录
        if (needFollowUp) {
          // 保存主问题的回答
          currentRecord.value.answer = answer;
          // 追问情况：添加到followUps
          currentRecord.value.followUps.push({
            question: feedback,
            answer: '', // 等待用户回答
          });
          currentRecord.value.feedback = feedback;

          return {
            action: 'follow_up',
            feedback,
            needFollowUp: true,
          };
        } else {
          // 回答满意：保存当前回答和反馈
          currentRecord.value.answer = answer;
          currentRecord.value.feedback = feedback;

          // 确保所有的追问回答都包含在记录中
          // 在将记录添加到历史记录之前，更新所有追问的回答
          const followUpsWithAnswers = currentRecord.value.followUps.map(followUp => ({
            ...followUp
          }));
          
          // 创建包含所有追问回答的完整记录
          const completeRecord = {
            ...currentRecord.value,
            followUps: followUpsWithAnswers
          };
          
          // 将完整的记录添加到历史记录
          interviewRecords.value.push(completeRecord);

          // 前端决定下一步：下一题或结束面试
          if (currentQuestionIndex.value < questions.value.length - 1) {
            // 进入下一题
            currentQuestionIndex.value++;
            currentQuestion.value = questions.value[currentQuestionIndex.value];

            // 初始化新的记录
            currentRecord.value = {
              questionIndex: currentQuestionIndex.value,
              question: currentQuestion.value,
              answer: '',
              followUps: [],
              feedback: '',
              analysis: null,
            };

            return {
              action: 'next_question',
              feedback,
              nextQuestion: currentQuestion.value,
              needFollowUp: false,
            };
          } else {
            // 面试结束
            isInterviewActive.value = false;
            return {
              action: 'interview_complete',
              feedback: '感谢您参与本次面试！',
              needFollowUp: false,
            };
          }
        }
      }
    } catch (error) {
      console.error('提交回答失败:', error);
      throw error;
    }
  };

  const submitFollowUpAnswer = async (answer) => {
    try {
      // 更新最后一个追问的回答
      if (currentRecord.value.followUps.length > 0) {
        const lastFollowUp = currentRecord.value.followUps[currentRecord.value.followUps.length - 1];
        lastFollowUp.answer = answer;
      }

      // 继续分析追问回答
      const response = await analyzeAnswer(currentQuestion.value, answer);

      if (response.success) {
        const { needFollowUp, feedback } = response.data;

        if (needFollowUp) {
          // 继续追问
          currentRecord.value.followUps.push({
            question: feedback,
            answer: '',
          });

          return {
            action: 'follow_up',
            feedback,
            needFollowUp: true,
          };
        } else {
          // 结束当前问题
          currentRecord.value.feedback = feedback;
          
          // 确保所有的追问回答都包含在记录中
          // 在将记录添加到历史记录之前，更新所有追问的回答
          const followUpsWithAnswers = currentRecord.value.followUps.map(followUp => ({
            ...followUp
          }));
          
          // 创建包含所有追问回答的完整记录
          const completeRecord = {
            ...currentRecord.value,
            followUps: followUpsWithAnswers
          };
          
          // 将完整的记录添加到历史记录
          interviewRecords.value.push(completeRecord);

          // 前端决定下一步
          if (currentQuestionIndex.value < questions.value.length - 1) {
            currentQuestionIndex.value++;
            currentQuestion.value = questions.value[currentQuestionIndex.value];

            currentRecord.value = {
              questionIndex: currentQuestionIndex.value,
              question: currentQuestion.value,
              answer: '',
              followUps: [],
              feedback: '',
              analysis: null,
            };

            return {
              action: 'next_question',
              feedback,
              nextQuestion: currentQuestion.value,
              needFollowUp: false,
            };
          } else {
            isInterviewActive.value = false;
            return {
              action: 'interview_complete',
              feedback: '感谢您参与本次面试！',
              needFollowUp: false,
            };
          }
        }
      }
    } catch (error) {
      console.error('提交追问回答失败:', error);
      throw error;
    }
  };

  const getInterviewSummary = () => {
    // 前端直接生成面试总结，无需后端接口
    return {
      sessionId: sessionId.value,
      candidateName: candidateName.value,
      interviewStyle: interviewStyle.value,
      startTime: new Date().toISOString(),
      records: interviewRecords.value,
      summary: {
        totalQuestions: interviewRecords.value.length,
        totalAnswers: interviewRecords.value.reduce((total, record) => {
          return total + 1 + record.followUps.length;
        }, 0),
      },
    };
  };

  const resetInterview = () => {
    sessionId.value = '';
    currentQuestionIndex.value = 0;
    currentQuestion.value = '';
    interviewRecords.value = [];
    isInterviewActive.value = false;
    interviewStyle.value = 'professional';
    candidateName.value = '面试者';
    currentRecord.value = {
      questionIndex: 0,
      question: '',
      answer: '',
      followUps: [],
      feedback: '',
      analysis: null,
    };
  };

  const exportRecords = () => {
    const exportData = {
      sessionId: sessionId.value,
      candidateName: candidateName.value,
      interviewStyle: interviewStyle.value,
      startTime: new Date().toISOString(),
      records: interviewRecords.value,
      summary: {
        totalQuestions: interviewRecords.value.length,
        totalAnswers: interviewRecords.value.reduce((total, record) => {
          return total + 1 + record.followUps.length;
        }, 0),
      },
    };

    return exportData;
  };

  return {
    // 状态
    sessionId,
    currentQuestionIndex,
    questions,
    currentQuestion,
    interviewRecords,
    isInterviewActive,
    interviewStyle,
    candidateName,
    currentRecord,
    
    // 计算属性
    totalQuestions,
    isLastQuestion,
    progress,
    
    // 方法
    startInterview,
    submitAnswer,
    submitFollowUpAnswer,
    getInterviewSummary,
    resetInterview,
    exportRecords,
  };
});