import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ─── Campus Knowledge Base ────────────────────────────────────────────────────

const BUILDINGS: Record<string, { aliases: string[]; desc: string; floor?: string; hours?: string }> = {
  "Main Gate":      { aliases: ["gate", "entrance", "entry", "main entry"], desc: "Main entrance to campus", hours: "24/7" },
  "Block A":        { aliases: ["block a", "cse", "it", "computer science", "information technology", "cs block", "it block"], desc: "CSE & IT departments", floor: "4 floors" },
  "Block B":        { aliases: ["block b", "ece", "eee", "electronics", "electrical"], desc: "ECE & EEE departments", floor: "4 floors" },
  "Block C":        { aliases: ["block c", "mech", "civil", "mechanical", "civil engineering"], desc: "Mechanical & Civil departments", floor: "3 floors" },
  "Central Library":{ aliases: ["library", "lib", "central lib", "reading room"], desc: "Central Library with reading rooms", floor: "3 floors", hours: "8am–10pm" },
  "Main Canteen":   { aliases: ["canteen", "cafeteria", "food", "mess", "eating", "lunch", "dinner", "breakfast"], desc: "Main dining area", hours: "7am–9pm" },
  "Admin Block":    { aliases: ["admin", "administration", "office", "fee", "admission", "registrar"], desc: "Administrative offices", floor: "2 floors", hours: "9am–5pm" },
  "Boys Hostel":    { aliases: ["boys hostel", "male hostel", "gents hostel", "boys accommodation"], desc: "Boys residential hostel", floor: "5 floors", hours: "24/7" },
  "Girls Hostel":   { aliases: ["girls hostel", "female hostel", "ladies hostel", "girls accommodation"], desc: "Girls residential hostel", floor: "5 floors", hours: "24/7" },
  "Sports Complex": { aliases: ["sports", "gym", "ground", "field", "football", "cricket", "basketball", "play"], desc: "Sports facilities & gym" },
  "Medical Center": { aliases: ["medical", "doctor", "nurse", "hospital", "health", "sick", "clinic", "first aid", "injury", "ambulance"], desc: "Campus medical center", hours: "24/7" },
  "Seminar Hall":   { aliases: ["seminar", "auditorium", "hall", "event", "lecture hall", "conference"], desc: "Seminar & event hall" },
  "Workshop Block": { aliases: ["workshop", "lab", "practical", "fabrication"], desc: "Workshop & practical labs" },
  "Parking Zone":   { aliases: ["parking", "park", "vehicle", "bike", "car", "scooter"], desc: "Vehicle parking area" },
};

const DISTANCES: string[] = [
  "Main Gate → Block A: ~4 min walk",
  "Main Gate → Central Library: ~7 min walk",
  "Main Gate → Admin Block: ~3 min walk",
  "Block A → Central Library: ~3 min walk",
  "Block A → Main Canteen: ~2 min walk",
  "Block A → Medical Center: ~2 min walk (adjacent)",
  "Block B → Block A: ~2 min walk",
  "Block C → Workshop Block: ~1 min walk (adjacent)",
  "Main Canteen → Boys Hostel: ~4 min walk",
  "Main Canteen → Girls Hostel: ~5 min walk",
  "Admin Block → Seminar Hall: ~3 min walk",
  "Sports Complex → Boys Hostel: ~3 min walk",
];

const SUGGESTED_QUESTIONS: string[] = [
  "How do I get to the library from Block A?",
  "Where is the canteen and when does it open?",
  "Where is the Medical Center?",
  "How far is Block B from the Main Gate?",
  "Where can I find the CSE department?",
  "Where is the Admin Block for fee payment?",
  "How do I reach the Sports Complex?",
  "Where is the nearest parking area?",
];

type Intent =
  | "navigation"
  | "hours"
  | "department"
  | "emergency"
  | "general"
  | "greeting"
  | "suggestion_request";

function detectIntent(text: string): Intent {
  const t = text.toLowerCase();

  if (/\b(hi|hello|hey|good morning|good afternoon|good evening|howdy)\b/.test(t))
    return "greeting";

  if (/\b(suggest|what can|what should|help me|don't know|ideas|options|examples)\b/.test(t))
    return "suggestion_request";

  if (/\b(emergency|urgent|hurt|injured|accident|help|ambulance|doctor|sick|pain)\b/.test(t))
    return "emergency";

  if (/\b(open|close|timing|time|hours|when|available)\b/.test(t))
    return "hours";

  if (/\b(department|course|branch|study|class|professor|faculty|exam)\b/.test(t))
    return "department";

  if (/\b(where|how to get|how do i go|directions|navigate|find|locate|reach|nearest|closest|way to|path to|route)\b/.test(t))
    return "navigation";

  return "general";
}

function matchBuilding(text: string): string[] {
  const t = text.toLowerCase();
  const matched: string[] = [];

  for (const [name, info] of Object.entries(BUILDINGS)) {
    if (
      info.aliases.some((alias) => t.includes(alias)) ||
      t.includes(name.toLowerCase())
    ) {
      matched.push(name);
    }
  }

  return Array.from(new Set(matched));
}

function buildContextSnippet(text: string): string {
  const buildings = matchBuilding(text);

  if (buildings.length === 0) return "";

  const lines: string[] = [];

  for (const b of buildings) {
    const info = BUILDINGS[b];

    let entry = `- ${b}: ${info.desc}`;

    if (info.floor) entry += `, ${info.floor}`;
    if (info.hours) entry += `, open ${info.hours}`;

    lines.push(entry);
  }

  const relevantDist = DISTANCES.filter((d) =>
    buildings.some((b) => d.toLowerCase().includes(b.toLowerCase()))
  );

  if (relevantDist.length > 0) {
    lines.push("Distances: " + relevantDist.join(" | "));
  }

  return lines.join("\n");
}

function buildSystemPrompt(intent: Intent, contextSnippet: string): string {
  const base = `You are RIMT Campus Guide — a friendly, knowledgeable senior student helping newcomers navigate RIMT University.

CAMPUS BUILDINGS & FACTS:
${Object.entries(BUILDINGS)
  .map(([name, info]) => {
    let line = `- ${name}: ${info.desc}`;

    if (info.floor) line += `, ${info.floor}`;
    if (info.hours) line += `, open ${info.hours}`;

    return line;
  })
  .join("\n")}

WALKING DISTANCES:
${DISTANCES.join("\n")}

SUGGESTED QUESTIONS:
${JSON.stringify(SUGGESTED_QUESTIONS)}`;

  const rules = `
RESPONSE RULES:
- Be warm, concise, helpful like a senior student
- Max 3 short sentences for navigation answers
- Always include walking time for directions
- If unsure, say so honestly
- For emergencies, prioritize Medical Center help
- Format responses in plain text only
- Avoid markdown headers`;

  const intentHint =
    intent === "navigation"
      ? "\nFOCUS: Give step-by-step directions with walking times."
      : intent === "emergency"
      ? "\nFOCUS: Give urgent medical guidance first."
      : intent === "hours"
      ? "\nFOCUS: Clearly mention timings and availability."
      : intent === "suggestion_request"
      ? '\nFOCUS: Return ONLY a valid JSON array like ["Q1?","Q2?"]'
      : intent === "greeting"
      ? "\nFOCUS: Greet warmly and offer help."
      : "";

  const contextBlock =
    contextSnippet ? `\nRELEVANT CONTEXT:\n${contextSnippet}` : "";

  return base + rules + intentHint + contextBlock;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, requestSuggestions } = body;

    if (requestSuggestions) {
      return NextResponse.json({
        success: true,
        content: "Here are some things you can ask me 👇",
        suggestions: SUGGESTED_QUESTIONS,
        intent: "suggestion_request",
      });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid messages" },
        { status: 400 }
      );
    }

    const validMessages = messages.filter(
      (m) =>
        m &&
        typeof m.role === "string" &&
        typeof m.content === "string" &&
        m.content.trim()
    );

    if (validMessages.length === 0) {
      return NextResponse.json(
        { error: "No valid messages" },
        { status: 400 }
      );
    }

    const lastUserMsg = [...validMessages]
      .reverse()
      .find((m) => m.role === "user");

    const lastText = lastUserMsg?.content ?? "";

    const intent = detectIntent(lastText);
    const contextSnippet = buildContextSnippet(lastText);
    const system = buildSystemPrompt(intent, contextSnippet);

    const trimmedMessages = validMessages
      .slice(-10)
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: system,
    });

    const prompt = trimmedMessages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n");

    const result = await model.generateContent(prompt);

    const content = result.response.text().trim();

    if (!content) {
      return NextResponse.json({
        success: false,
        content:
          "Sorry, I couldn't understand that properly. Please try asking again.",
        intent,
      });
    }

    if (intent === "suggestion_request") {
      try {
        const parsed = JSON.parse(content);

        if (Array.isArray(parsed)) {
          return NextResponse.json({
            success: true,
            content: parsed.join("\n"),
            suggestions: parsed,
            intent,
          });
        }
      } catch {
        // fallback
      }
    }

    return NextResponse.json({
      success: true,
      content,
      intent,
      suggestions:
        intent === "suggestion_request"
          ? SUGGESTED_QUESTIONS
          : undefined,
    });
  } catch (err: unknown) {
    console.error("Chat API error:", err);

    const message =
      err instanceof Error ? err.message : "Unknown error";

    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 }
    );
  }
}
