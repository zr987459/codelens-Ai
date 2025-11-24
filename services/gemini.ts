import { GoogleGenAI, Type, GenerateContentParameters } from "@google/genai";
import { CodeState, GeminiCodeResponse } from "../types";

const SYSTEM_INSTRUCTION = `
你叫 CodeLens，是一个全栈 Web 开发专家和代码分析 AI。
你的目标是协助用户分析他们的 HTML、CSS 和 JavaScript 代码，解释逻辑，修复错误，并根据请求生成新代码。

关键输出规则：
1. 你必须始终返回一个有效的 JSON 对象。
2. JSON 对象必须严格遵守定义的 schema。
3. **Thinking Process**: 在 'thoughts' 字段中，先进行深度、一步步的逻辑推理和分析。
   - 分析用户的意图。
   - 检查当前代码结构。
   - 规划修改步骤。
   - 解释为什么选择这种实现方式（例如性能、兼容性或美观度）。
4. 如果用户要求修改代码，请在 'codeUpdates' 对象中提供相应文件（HTML、CSS 或 JS）的【完整】更新内容。不要提供部分片段。
5. 如果不需要修改代码（例如只是解释），请将 'codeUpdates' 设置为 null 或省略特定的文件键。
6. 在 'analysis' 字段中，直接回答用户的问题，或总结你的修改。使用 Markdown 格式。
7. **所有回复（analysis 和 thoughts 字段的内容）必须使用中文。**
`;

// Define the response schema structure for reuse
const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    thoughts: {
      type: Type.STRING,
      description: "Detailed step-by-step reasoning, architectural planning, and analysis in Chinese.",
    },
    analysis: {
      type: Type.STRING,
      description: "Final answer or explanation for the user in Markdown (Chinese).",
    },
    codeUpdates: {
      type: Type.OBJECT,
      nullable: true,
      properties: {
        html: { type: Type.STRING, description: "Full updated HTML code if changed." },
        css: { type: Type.STRING, description: "Full updated CSS code if changed." },
        js: { type: Type.STRING, description: "Full updated JS code if changed." },
      },
    },
  },
  required: ["thoughts", "analysis"],
};

export const analyzeAndModifyCode = async (
  currentCode: CodeState,
  userPrompt: string,
  modelName: string = "gemini-2.5-flash",
  attachment?: string, // Base64 image
  signal?: AbortSignal
): Promise<GeminiCodeResponse> => {
  const startTime = performance.now();
  
  // 1. Get Configuration
  const provider = localStorage.getItem('codelens_provider') || 'google';
  const manualKey = localStorage.getItem('codelens_api_key');
  
  // 2. Resolve API Key
  const apiKey = manualKey || (provider === 'google' ? process.env.API_KEY : '');

  if (!apiKey) {
    throw new Error("未找到 API Key。请点击右上角的设置按钮配置您的 API Key。");
  }

  // 3. Prepare Context
  const codeContext = `
CURRENT CODE STATE:
--- HTML ---
${currentCode.html}
--- CSS ---
${currentCode.css}
--- JS ---
${currentCode.js}
--- END CODE ---
`;

  const fullPrompt = `${codeContext}\n\nUSER REQUEST: "${userPrompt}"\n\nAnalyze the request relative to the current code. Return a JSON response.`;

  let parsedResponse: GeminiCodeResponse;
  let rawText = "";

  // --- BRANCH 1: GOOGLE OFFICIAL SDK ---
  if (provider === 'google') {
    const ai = new GoogleGenAI({ apiKey });
    
    // Determine actual model and config based on selection
    let targetModel = modelName;
    let thinkingConfig = undefined;

    // Handle Thinking Model
    if (modelName === 'gemini-2.5-flash-thinking') {
      targetModel = 'gemini-2.5-flash';
      // Set a high budget for "Deep Thinking"
      // 2.5 Flash max is 24576, we use a generous amount for complex coding tasks
      thinkingConfig = { thinkingBudget: 16384 }; 
    }

    const config: GenerateContentParameters['config'] = {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    };

    if (thinkingConfig) {
      config.thinkingConfig = thinkingConfig;
    }

    // Build contents part
    const parts: any[] = [{ text: fullPrompt }];
    if (attachment) {
      // attachment is expected to be "data:image/png;base64,..."
      // extract just the base64 part and type
      const match = attachment.match(/^data:(.*?);base64,(.*)$/);
      if (match) {
        parts.unshift({
          inlineData: {
            mimeType: match[1],
            data: match[2]
          }
        });
      }
    }

    try {
      if (signal?.aborted) {
        throw new Error("Request aborted");
      }

      const response = await ai.models.generateContent({
        model: targetModel,
        contents: { parts },
        config: config,
      });

      if (signal?.aborted) {
        throw new Error("Request aborted");
      }

      rawText = response.text || "";
      if (!rawText) throw new Error("No response from AI");

      parsedResponse = JSON.parse(rawText) as GeminiCodeResponse;
    } catch (error: any) {
      // If it's an abort error, throw it cleanly without logging as API error
      if (error.message === "Request aborted" || signal?.aborted) {
        throw new Error("Request aborted");
      }
      console.error("Gemini API Error:", error);
      throw error;
    }
  } 
  
  // --- BRANCH 2: OPENAI COMPATIBLE (SILICONFLOW / DEEPSEEK) ---
  else {
    const baseUrl = localStorage.getItem('codelens_base_url') || 'https://api.siliconflow.cn/v1';
    const customModel = localStorage.getItem('codelens_custom_model');
    
    // Auto-map model names if custom model not set
    let apiModel = customModel;
    if (!apiModel) {
        if (modelName.includes('thinking')) apiModel = 'deepseek-ai/DeepSeek-R1'; // Map thinking to R1
        else if (modelName.includes('pro')) apiModel = 'deepseek-ai/DeepSeek-V3';
        else apiModel = 'deepseek-ai/DeepSeek-V3'; // Default fallback
    }

    // Construct messages
    const messages: any[] = [
        { role: "system", content: SYSTEM_INSTRUCTION + "\nIMPORTANT: You MUST return valid JSON only." }
    ];

    // User message content (Text + optional Image)
    const userContent: any[] = [{ type: "text", text: fullPrompt }];
    
    if (attachment) {
      userContent.push({
        type: "image_url",
        image_url: {
          url: attachment // Many OpenAI compatible APIs support data URI
        }
      });
    }

    messages.push({ role: "user", content: userContent });

    try {
        if (signal?.aborted) {
            throw new Error("Request aborted");
        }

        const response = await fetch(`${baseUrl.replace(/\/+$/, '')}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: apiModel,
                messages: messages,
                response_format: { type: "json_object" },
                temperature: 0.7
            }),
            signal: signal // Fetch supports signal directly
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(`API Error (${response.status}): ${errData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        
        rawText = content || "";
        
        if (!rawText) throw new Error("No content received from API");

        const cleanedContent = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        parsedResponse = JSON.parse(cleanedContent) as GeminiCodeResponse;

    } catch (error: any) {
        if (error.name === 'AbortError' || signal?.aborted) {
             throw new Error("Request aborted");
        }
        console.error("Custom Provider API Error:", error);
        throw error;
    }
  }

  const endTime = performance.now();
  parsedResponse.thinkingDuration = endTime - startTime;
  parsedResponse.rawLog = rawText;

  return parsedResponse;
};