import { generateMorningQuote } from './src/lib/ai';

async function test() {
  console.log("Testing Groq...");
  try {
    const res = await generateMorningQuote();
    console.log("SUCCESS:", res);
  } catch (e: any) {
    console.log("ERROR:", e);
  }
}
test();
