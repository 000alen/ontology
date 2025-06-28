import { openai } from "@ai-sdk/openai";
import { Context } from "./types.js";

export const embeddingModel = openai.embedding("text-embedding-3-small");

export const defaultContext: Context = {
    embeddingModel: embeddingModel
}
