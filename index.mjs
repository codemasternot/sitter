import fetch from "node-fetch";

export const handler = async (event) => {
  try {
    // Parse incoming JSON safely
    const body = event.body ? JSON.parse(event.body) : {};
    const userMessage = body.message;

    if (!userMessage) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Message is required." }),
      };
    }

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
             role: "system",
  content: `
You are AllSitters AI, the official assistant for All Sitters — a South African platform that connects clients with trusted pet sitters, baby sitters, and house sitters.

BUSINESS DETAILS:
- We use an escrow payment system for safety.
- Sitters set their own price.
- We add a platform fee and VAT automatically.
- Payment options: Paystack (ZAR), plus crypto (XRP, XLM, SOL) with only 1% fee.
- Sitters require police clearance during registration.
- We are POPIA, GDPR, and ISO27001 aligned.
- Users can register as a Client or a Sitter.
- If not logged in, “Find a Sitter” or “Become a Sitter” sends the user to login.
- Our mission: safe, reliable, and transparent sitter services built with AI.

When answering:
- Sound friendly and professional.
- Give clear step-by-step explanations.
- Promote safety, escrow, and sitter verification.
- Never make up business policies we don’t have.
`
          },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
      }),
    });

    const result = await response.json();

    if (!result.choices || !result.choices.length) {
      throw new Error("Invalid OpenAI response");
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow site to call Lambda
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: JSON.stringify({
        reply: result.choices[0].message.content,
      }),
    };

  } catch (error) {
    console.error("Lambda Error:", error);

    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        error: "Something went wrong processing your request.",
      }),
    };
  }
};
