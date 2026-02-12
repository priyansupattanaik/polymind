
const modelsConfig = {
    "groq-qwen": {
        name: "Qwen 3 32B (Groq)",
        provider: "groq",
        model: "qwen/qwen3-32b",
        params: { temperature: 0.6, max_completion_tokens: 1024, top_p: 0.95, reasoning_effort: "default" }
    },
    "groq-gptoss": {
        name: "GPT OSS 20B (Groq)",
        provider: "groq",
        model: "openai/gpt-oss-20b",
        params: { temperature: 1, max_completion_tokens: 1024, top_p: 1, reasoning_effort: "medium" }
    },
    "groq-versatile": {
        name: "Llama 3.3 70B (Groq)",
        provider: "groq",
        model: "llama-3.3-70b-versatile",
        params: { temperature: 1, max_completion_tokens: 1024, top_p: 1 }
    },
    "or-aurora": {
        name: "Liquid LFM 2.5 (OpenRouter)",
        provider: "openrouter",
        model: "liquid/lfm-2.5-1.2b-thinking:free",
        params: { max_tokens: 1024 }
    },
    "or-trinity": {
        name: "Trinity Large Preview (OpenRouter)",
        provider: "openrouter",
        model: "arcee-ai/trinity-large-preview:free",
        params: { max_tokens: 512 },
        extra_body: { reasoning: { enabled: true } }
    },
    "or-liquid": {
        name: "Liquid LFM 2.5 (OpenRouter)",
        provider: "openrouter",
        model: "liquid/lfm-2.5-1.2b-thinking:free",
        params: { max_tokens: 512 }
    },
    "or-seed": {
        name: "Seedream 4.5 (OpenRouter)",
        provider: "openrouter",
        model: "bytedance-seed/seedream-4.5",
        extra_body: { modalities: ["image"] }
    },
    "nvidia-deepseek": {
        name: "DeepSeek V3.1 (Nvidia)",
        provider: "nvidia",
        model: "deepseek-ai/deepseek-v3.1",
        params: { temperature: 0.2, top_p: 0.7, max_tokens: 1024, seed: 42 },
        extra_body: { chat_template_kwargs: { thinking: true } }
    }
};

const CHAIRMAN_CONFIG = {
    name: "Chairman",
    model: "llama-3.3-70b-versatile",
    params: { temperature: 0.7, max_completion_tokens: 1024 }
};

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
};

async function callProvider(memberConfig, prompt) {
    const apiKey = getApiKey(memberConfig.provider);
    if (!apiKey) {
        return { name: memberConfig.name, content: "API Key missing." };
    }

    const url = getProviderUrl(memberConfig.provider);
    
    const payload = {
        model: memberConfig.model,
        messages: [{ role: "user", content: prompt }],
        stream: false,
        ...memberConfig.params,
        ...memberConfig.extra_body
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error for ${memberConfig.name}: ${response.status} - ${errorText}`);
            return { name: memberConfig.name, content: `API returned an error (status ${response.status}).` };
        }

        const data = await response.json();
        return parseResponse(data, memberConfig);

    } catch (e) {
        console.error(`Connection Error for ${memberConfig.name}: ${e}`);
        return { name: memberConfig.name, content: "Connection error." };
    }
}

function getApiKey(provider) {
    switch (provider) {
        case "groq": return process.env.GROQ_API_KEY;
        case "nvidia": return process.env.NVIDIA_API_KEY;
        case "openrouter": return process.env.OPENROUTER_API_KEY;
        default: return null;
    }
}

function getProviderUrl(provider) {
    switch (provider) {
        case "groq": return "https://api.groq.com/openai/v1/chat/completions";
        case "nvidia": return "https://integrate.api.nvidia.com/v1/chat/completions";
        case "openrouter": return "https://openrouter.ai/api/v1/chat/completions";
        default: return "";
    }
}

function parseResponse(data, memberConfig) {
    if (data.choices && data.choices.length > 0) {
        const choice = data.choices[0];
        const message = choice.message || {};
        let content = message.content || "";

        if (!content && message.reasoning_content) content = message.reasoning_content;
        if (!content && message.reasoning) content = message.reasoning;
        if (!content && choice.text) content = choice.text;
        
        // Image handling for Seedream
        if (!content && message.images && message.images.length > 0) {
             const imageUrl = message.images[0].url || message.images[0].image_url?.url;
             if (imageUrl) content = `![Dream Generated](${imageUrl})`;
        }

        return { name: memberConfig.name, content: content.trim() || "No response generated." };
    }
    return { name: memberConfig.name, content: "Error: No content returned." };
}

async function synthesizeResponses(prompt, results) {
    if (!results || results.length === 0) return "No active council members available.";

    const deliberationText = results.map(r => `=== ${r.name} ===\n${r.content}`).join("\n\n");
    const synthesisPrompt = `
        You are the Chairman of the AI Council.
        
        The user asked: "${prompt}"
        
        Here are the deliberations from the council members:
        ${deliberationText}
        
        Based on these inputs, provide a comprehensive, synthesized final answer. 
        Acknowledge reliable points, resolve conflicts, and give a unified conclusion.
        Do not just summarize; provide the best possible answer.
    `;

    const response = await callProvider({ ...CHAIRMAN_CONFIG, provider: "groq" }, synthesisPrompt);
    return response.content;
}

export const handler = async (event, context) => {
    // Handle CORS Preflight
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers: CORS_HEADERS, body: "" };
    }

    const path = event.path.replace("/.netlify/functions/api", "").replace("/api", ""); // Normalize path

    // GET /models
    if (path === "/models" && event.httpMethod === "GET") {
        const models = Object.keys(modelsConfig).map(id => ({ id, name: modelsConfig[id].name }));
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify(models)
        };
    }

    // POST /council
    if (path === "/council" && event.httpMethod === "POST") {
        try {
            const body = JSON.parse(event.body);
            const prompt = (body.prompt || "").trim();
            const activeModels = body.active_models || [];
            const dreamMode = body.dream_mode || false;

            if (!prompt) return { statusCode: 400, headers: CORS_HEADERS, body: "Prompt cannot be empty." };
            if (prompt.length > 500) return { statusCode: 400, headers: CORS_HEADERS, body: "Input limit exceeded (500 chars)." };

            const modelsToUseIds = dreamMode ? ["or-seed"] : activeModels;
            const selectedConfig = modelsToUseIds
                .filter(id => modelsConfig[id])
                .map(id => modelsConfig[id]);

            // Parallel Execution
            const promises = selectedConfig.map(config => callProvider(config, prompt));
            const results = await Promise.all(promises);

            let unifiedAnswer = "";
            let chairmanName = "";

            if (dreamMode) {
                unifiedAnswer = results.length > 0 ? results[0].content : "Dream generation failed.";
                chairmanName = "Seedream Protocol";
            } else {
                unifiedAnswer = await synthesizeResponses(prompt, results);
                chairmanName = "Llama 3.3 70B (Groq)";
            }

            return {
                statusCode: 200,
                headers: CORS_HEADERS,
                body: JSON.stringify({
                    unified_response: unifiedAnswer,
                    individual_responses: results,
                    chairman_model: chairmanName
                })
            };

        } catch (error) {
            console.error("Handler Error:", error);
            return {
                statusCode: 500,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: "Internal Server Error" })
            };
        }
    }

    return { statusCode: 404, headers: CORS_HEADERS, body: "Not Found" };
};
