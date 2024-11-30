import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const google_llm_api_key = process.env.GOOGLE_LLM_API_KEY || 'AIzaSyDxAfnwI78Lf7UslP-16_uK_CmUKm88BFg';

const genAI = new GoogleGenerativeAI(google_llm_api_key);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export { model };