from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langchain_openai import ChatOpenAI
from loguru import logger
from pydantic import BaseModel, SecretStr
from dotenv import load_dotenv
import os
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from datetime import datetime

load_dotenv()
# 定义请求体模型
class AnalyzeRequest(BaseModel):
    question: str
    answer: str

silicon_flow_api_base = os.getenv("SILICON_FLOW_API_BASE")
silicon_flow_api_key = os.getenv("SILICON_FLOW_API_KEY")
logger.info(f"silicon_flow_api_base: {silicon_flow_api_base}")
model = ChatOpenAI(
    base_url = silicon_flow_api_base,
    api_key = SecretStr(silicon_flow_api_key),
    model = "Qwen/Qwen3-30B-A3B-Thinking-2507",)
prompt = """
你是一位专业的面试官，正在进行一场行为面试。你的任务是分析面试者对行为问题的回答质量，并决定是否需要进一步追问。

面试问题：{question}

面试者回答：{answer}

请分析面试者回答的质量，考虑以下方面：
1. 回答是否具体且有实质性内容
2. 是否提供了相关的例子或情境
3. 是否清楚地说明了自己在情境中的角色和行动
4. 是否说明了结果和影响
5. 回答是否充分完整

基于你的分析，做出以下决策：

如果回答不够具体、缺乏细节或没有提供充分的例子，请生成一个有针对性的追问，例如：
- "能具体说说你在那个项目中遇到的挑战吗？"
- "你刚才提到了...，能详细解释一下你是如何处理的吗？"
- "这个结果对你和团队有什么影响？"

如果回答已经足够具体、详细且完整，请确认并表示感谢，例如：
- "明白了，谢谢你的详细回答。"
- "很好的分享，我了解了你在这方面的经验。"
- "感谢你的详细说明。"

请以以下JSON格式返回你的决策：

{{"needFollowUp": true/false, "feedback": "你的追问问题或确认信息"}}

示例1（需要追问）：
{{"needFollowUp": true, "feedback": "你提到了解决了一个技术难题，能具体说说这个难题是什么，以及你是如何解决的吗？"}}

示例2（不需要追问）：
{{"needFollowUp": false, "feedback": "明白了，谢谢你的详细回答。"}}
"""
system_prompt = ChatPromptTemplate.from_template(prompt)

chain = system_prompt | model | JsonOutputParser()

app = FastAPI()

# 添加CORS中间件以支持前端跨域请求
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该指定具体的域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/analyze")
async def analyze_answer(request: AnalyzeRequest):
    logger.info(f"问题: {request.question}，回答: {request.answer}")
    result = chain.invoke({"question": request.question, "answer": request.answer})
    return {
        "success": True,
        "data": {
            "needFollowUp": result["needFollowUp"],
            "feedback": result["feedback"]
        },
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}