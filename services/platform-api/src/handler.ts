import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import Groq from "groq-sdk";

type Event = {
  body?: string | null;
};

// Model mapping: Bedrock model IDs to Groq model IDs
const GROQ_MODEL_MAP: Record<string, string> = {
  "anthropic.claude-3-7-sonnet-20250219-v1:0": "llama-3.3-70b-versatile",
  "anthropic.claude-3-5-sonnet-20241022-v1:0": "llama-3.3-70b-versatile",
  "anthropic.claude-3-haiku-20240307-v1:0": "llama-3.1-8b-instant",
  "default": "llama-3.3-70b-versatile"
};

async function invokeBedrock(modelId: string, prompt: string, region: string) {
  const client = new BedrockRuntimeClient({ region });
  
  const request = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 256,
    messages: [{ role: "user", content: [{ type: "text", text: prompt }] }]
  };

  console.log("Invoking Bedrock model", { modelId, requestSize: JSON.stringify(request).length });

  const result = await client.send(new InvokeModelCommand({
    modelId,
    contentType: "application/json",
    accept: "application/json",
    body: Buffer.from(JSON.stringify(request))
  }));

  console.log("Bedrock response received", { 
    statusCode: result.$metadata.httpStatusCode,
    bodySize: result.body?.length 
  });

  return result.body ? JSON.parse(Buffer.from(result.body).toString()) : {};
}

async function invokeGroq(modelId: string, prompt: string) {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    throw new Error("GROQ_API_KEY environment variable is not set");
  }

  const groq = new Groq({ apiKey: groqApiKey });
  const groqModelId = GROQ_MODEL_MAP[modelId] || GROQ_MODEL_MAP["default"];

  console.log("Invoking Groq model", { originalModelId: modelId, groqModelId, prompt });

  const completion = await groq.chat.completions.create({
    model: groqModelId,
    messages: [
      { role: "user", content: prompt }
    ],
    max_tokens: 256,
    temperature: 0.7
  });

  console.log("Groq response received", { 
    model: completion.model,
    usage: completion.usage
  });

  // Format response to match Bedrock structure
  return {
    content: completion.choices[0]?.message?.content || "",
    model: completion.model,
    usage: completion.usage
  };
}

export const handler = async (event: Event) => {
  console.log("Handler invoked", { event: JSON.stringify(event) });

  const body = (() => {
    try { 
      const parsed = event.body ? JSON.parse(event.body) : {};
      console.log("Parsed request body", { body: parsed });
      return parsed;
    } catch (error) { 
      console.error("Failed to parse request body", { error, rawBody: event.body });
      return {}; 
    }
  })();

  const modelId = body.model ?? "anthropic.claude-3-7-sonnet-20250219-v1:0";
  const prompt  = body.prompt ?? "Hello from Fin-AI Platform!";
  const region = process.env.AWS_REGION || "us-east-1";
  const provider = body.provider || "auto"; // Default to auto (Bedrock with Groq fallback)

  console.log("Request parameters", { modelId, prompt, region, provider });

  let output: any;
  let usedProvider = provider;

  // Try Bedrock first (or if explicitly requested)
  if (provider === "bedrock" || provider === "auto") {
    try {
      output = await invokeBedrock(modelId, prompt, region);
      usedProvider = "bedrock";
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Bedrock invocation failed", { 
        error: errorMessage,
        modelId,
        region
      });

      // Fallback to Groq if Bedrock fails and provider is "auto"
      if (provider === "auto") {
        console.log("Falling back to Groq due to Bedrock failure");
        try {
          output = await invokeGroq(modelId, prompt);
          usedProvider = "groq";
        } catch (groqError) {
          console.error("Groq fallback also failed", { 
            error: groqError instanceof Error ? groqError.message : String(groqError)
          });
          throw groqError;
        }
      } else {
        // If provider is explicitly "bedrock", don't fallback
        throw error;
      }
    }
  } else if (provider === "groq") {
    // Use Groq directly
    try {
      output = await invokeGroq(modelId, prompt);
      usedProvider = "groq";
    } catch (error) {
      console.error("Groq invocation failed", { 
        error: error instanceof Error ? error.message : String(error),
        modelId
      });
      throw error;
    }
  } else {
    return {
      statusCode: 400,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ 
        error: "Invalid provider",
        message: `Provider must be 'bedrock', 'groq', or 'auto'. Got: ${provider}`
      })
    };
  }
  
  const response = {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ 
      modelId, 
      provider: usedProvider,
      output 
    }, null, 2)
  };

  console.log("Returning success response", { statusCode: response.statusCode, provider: usedProvider });
  return response;
};
