import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const generateMorningQuote = async (): Promise<string> => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are Planny, a cute, highly motivating, and highly productive AI assistant. You generate short, energetic, and cute morning quotes to motivate the user to conquer their day. Use emojis. Keep it under 2 sentences."
        },
        {
          role: "user",
          content: "Generate a morning motivation quote."
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.7,
      max_completion_tokens: 100,
      top_p: 1,
    });

    return completion.choices[0]?.message?.content || "Good morning! Let's get things done today! 🐾✨";
  } catch (error) {
    console.error("Groq generation error:", error);
    return "Good morning! Let's get things done today! 🐾✨";
  }
};
