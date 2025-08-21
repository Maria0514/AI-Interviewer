import axios from 'axios';

// 设置默认基础URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// 生成UUID的函数
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// 获取或生成session_id
function getSessionId() {
  let sessionId = localStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = generateUUID();
    localStorage.setItem('session_id', sessionId);
  }
  return sessionId;
}

// API调用函数
export async function analyzeAnswer(question, answer) {
  try {
    const sessionId = getSessionId();
    const response = await axios.post(`${API_BASE_URL}/analyze`, {
      question,
      answer,
      session_id: sessionId
    });
    return response.data;
  } catch (error) {
    console.error('API调用失败:', error);
    throw error;
  }
}