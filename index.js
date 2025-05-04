// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");

// Import the Bedrock Runtime client for Claude models
const {
  BedrockRuntimeClient,
  InvokeModelCommand,
} = require("@aws-sdk/client-bedrock-runtime");

// Initialize the AWS Bedrock client
const bedrockClient = new BedrockRuntimeClient({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Define model configurations
const MODELS = {
  CLAUDE: {
    id: "apac.anthropic.claude-3-5-sonnet-20240620-v1:0", // Using Claude 3 Sonnet instead of 3.5
    formatPrompt: (prompt) => ({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 1000,
      temperature: 0.7,
      top_p: 0.9,
      system:
        "You are a helpful assistant that rephrases text. Provide only the rephrased text with no additional commentary.",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    }),
    extractResponse: (responseBody) => {
      if (responseBody.content && responseBody.content.length > 0) {
        return responseBody.content[0].text.trim();
      } else if (responseBody.completion) {
        return responseBody.completion.trim();
      } else {
        return "Error: Could not extract response";
      }
    },
  },
  LLAMA: {
    id: "meta.llama3-8b-instruct-v1:0",
    formatPrompt: (prompt) => ({
      prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
      temperature: 0.7,
      top_p: 0.9,
    }),
    extractResponse: (responseBody) => {
      return responseBody.generation.trim();
    },
  },
};

// Select the model to use based on environment variable or default to CLAUDE
const defaultModel = process.env.DEFAULT_MODEL || "CLAUDE";
const MODEL = MODELS[defaultModel] || MODELS.CLAUDE;

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", model: MODEL.id });
});

// Helper function for rephrasing messages
async function rephraseMessage(tone, message, res, next) {
  try {
    if (!message || message.trim() === "") {
      return res.json({
        response_type: "ephemeral",
        text: "Please provide a message to rephrase.",
      });
    }

    const prompt = `Rephrase the following message to improve ${tone}:\n"${message}". Strictly include only the following
    1. Rephrased message
    2. No additional text
    3. No formatting
    4. No markdown
    5. No code blocks
    Nothing other than the rephrased message should be included in the response. I want only the rephrased text very strictly. Don't include phrases like "Here is the rephrased message" or "The rephrased message is" or anything else. Just the rephrased text. No other text. No formatting. No markdown. No code blocks. Just the rephrased text. Nothing else.
    `;

    // Prepare the request payload based on the selected model
    const payload = MODEL.formatPrompt(prompt);

    // Use the InvokeModel API for all models
    const command = new InvokeModelCommand({
      modelId: MODEL.id,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(Buffer.from(response.body).toString());

    // Extract the response based on the selected model
    const rephrased = MODEL.extractResponse(responseBody);

    // Return the rephrased text as an ephemeral message (only visible to the user who triggered it)
    res.json({
      response_type: "ephemeral",
      text: rephrased,
    });
  } catch (err) {
    console.error("Error details:", JSON.stringify(err, null, 2));
    next(err);
  }
}

// Handle /polite endpoint
app.post("/polite", async (req, res, next) => {
  const tone = "polite";
  const message = req.body.text;
  await rephraseMessage(tone, message, res, next);
});

// Handle /clarity endpoint
app.post("/clarity", async (req, res, next) => {
  const tone = "clarity";
  const message = req.body.text;
  await rephraseMessage(tone, message, res, next);
});

// Handle /simple endpoint
app.post("/simple", async (req, res, next) => {
  const tone = "simple";
  const message = req.body.text;
  await rephraseMessage(tone, message, res, next);
});

// 404 handler
app.use((req, res) => {
  res.status(200).json({
    response_type: "ephemeral",
    text: "Command not found. Available commands: /polite, /clarity, /simple",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(200).json({
    response_type: "ephemeral",
    text:
      process.env.NODE_ENV === "production"
        ? "Sorry, something went wrong. Please try again later."
        : `Error: ${err.message}`,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Slack app listening on port ${PORT}`));
