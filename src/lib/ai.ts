import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const generateMorningQuote = async (userName?: string, todayTasks?: string[]): Promise<string> => {
  try {
    const taskContext = todayTasks && todayTasks.length > 0
      ? `Their tasks for today are: ${todayTasks.join(', ')}.`
      : `They haven't added any tasks for today yet.`;

    const nameStr = userName ? userName : 'the user';

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are Planny, a cute, highly motivating, slightly unhinged, and highly productive AI assistant.\n\nYou are talking to ${nameStr}. ${taskContext}\n\nGenerate a short, energetic, cute, and highly personalized morning quote to motivate them to conquer their specific tasks. Don't be boring. You can be a little funny or roast them slightly if they have boring tasks. Use emojis. Keep it under 2 sentences max. Keep it completely fresh every time.`
        },
        {
          role: "user",
          content: "Generate my personalized morning motivation quote right now!"
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.9, // Higher temperature for more variance and less boring text
      max_completion_tokens: 100,
      top_p: 1,
    });

    return completion.choices[0]?.message?.content || `Good morning ${userName || ''}! Let's crush these tasks today! 🐾✨`;
  } catch (error: any) {
    console.error("Groq morning generation error:", error);
    return `Good morning! Let's get things done today! 🐾✨`;
  }
};

export const generateWeeklyReportReview = async (
  userName: string | null,
  completedCount: number,
  totalCount: number,
  notableTasks: string[]
): Promise<string> => {
  try {
    const nameStr = userName ? userName : 'the user';
    const rate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    let context = `They completed ${completedCount} out of ${totalCount} tasks this week (${rate}% completion rate). `;
    if (notableTasks.length > 0) {
      context += `Some notable tasks they worked on include: ${notableTasks.slice(0, 5).join(', ')}.`;
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are Planny, a brutally honest but cute AI productivity assistant. You are writing a weekly high-level review for ${nameStr}.\n\nContext to analyze: ${context}\n\nWrite a 2-3 sentence paragraph reviewing their week. If their completion rate is high (>80%), praise them like crazy. If it's average (50-80%), give them a pep talk. If it's low (<50%), give them a cute but savage roast about being lazy. Use emojis. Speak directly to them.`
        },
        {
          role: "user",
          content: "Give me my weekly productivity roasting/praise!"
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.8,
      max_completion_tokens: 150,
      top_p: 1,
    });

    return completion.choices[0]?.message?.content || `You completed ${completedCount} tasks this week! Let's aim even higher next week! 🚀`;
  } catch (error: any) {
    console.error("Groq weekly generation error:", error);
    return `You completed ${completedCount} tasks this week! Let's aim even higher next week! 🚀`;
  }
};
