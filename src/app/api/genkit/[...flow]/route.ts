import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
import { defineFlow, runFlow } from "genkit/flow";
import * as z from "zod";
import { NextRequest, NextResponse } from "next/server";

// Import your flows
import * as productRecommendations from "@/ai/flows/product-recommendations";

// Configure Genkit
genkit({
  plugins: [googleAI()],
  logSinks: [],
  enableTracing: true,
});

// Create a list of all flows you want to expose
const flows = [productRecommendations.getProductRecommendations];

// This is the magic that exposes the flows as API routes.
// The flow name is used as the path.
// e.g. /api/genkit/productRecommendationFlow
export async function POST(
  req: NextRequest,
  { params }: { params: { flow: string[] } }
) {
  const flowName = params.flow.join("/");
  const flow = flows.find((f) => f.name === flowName);
  
  if (!flow) {
    return NextResponse.json({ error: "Flow not found" }, { status: 404 });
  }

  try {
    const input = await req.json();
    const result = await runFlow(flow as any, input);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`Error running flow ${flowName}:`, error);
    return NextResponse.json(
      { error: "Error running flow", details: error.message },
      { status: 500 }
    );
  }
}
