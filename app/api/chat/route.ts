import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM = `You are RIMT Campus AI — a helpful navigation assistant for RIMT University students.

Campus buildings: Main Gate, Block A (CSE/IT, 4F), Block B (ECE/EEE, 4F), Block C (Mech/Civil, 3F), Central Library (3F), Main Canteen, Admin Block (2F), Boys Hostel (5F), Girls Hostel (5F), Sports Complex, Medical Center (24/7), Seminar Hall, Workshop Block, Parking Zone.

Key distances: Gate→Block A ~4 min, Gate→Library ~7 min, Block A→Library ~3 min, Medical is near Block A and Canteen.

Rules:
- Answers must be 1–3 sentences max
- Always include approximate walking time when giving directions
- Be friendly, like a helpful senior student
- If unsure, say so honestly`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    const response = await client.messages.create({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 256,
      system:     SYSTEM,
      messages:   messages.slice(-8),
    });

    const content = response.content
      .filter((c) => c.type === "text")
      .map((c) => (c as { type: "text"; text: string }).text)
      .join("");

    return NextResponse.json({ content });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: "Failed to respond" }, { status: 500 });
  }
}