import axios from 'axios';

// 设置默认基础URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// API调用函数
export async function analyzeAnswer(question, answer) {
  try {
    const response = await axios.post(`${API_BASE_URL}/analyze`, {
      question,
      answer
    });
    return response.data;
  } catch (error) {
    console.error('API调用失败:', error);
    throw error;
  }
}