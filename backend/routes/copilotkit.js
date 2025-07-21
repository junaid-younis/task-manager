const express = require("express");
const router = express.Router();
const {
  CopilotRuntime,
  GroqAdapter,
  OpenAIAdapter,
  copilotRuntimeNodeHttpEndpoint,
} = require("@copilotkit/runtime");

const runtime = new CopilotRuntime();

// Choose one adapter:
const serviceAdapter = new GroqAdapter({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.1-8b-instant" // Or other Groq model
});

// const serviceAdapter = new OpenAIAdapter({
//   apiKey: process.env.OPENAI_API_KEY,
//   model: "gpt-4-turbo"
// });

const handler = copilotRuntimeNodeHttpEndpoint({
  endpoint: "/copilotkit",
  runtime,
  serviceAdapter,
});

router.use(async (req, res, next) => {
  try {
    await handler(req, res);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
