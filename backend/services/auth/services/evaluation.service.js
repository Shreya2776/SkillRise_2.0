import { evaluateAnswer } from "./llm.service.js";
import { validateScores, calculateOverallScore } from "../utils/scoring.js";

export async function processAnswer({ role, level, question, answer }) {
    const rawEvaluation = await evaluateAnswer({
        role,
        level,
        question,
        answer
    });

    // Ensure scores are in correct format and within range
    if (rawEvaluation.score) {
        rawEvaluation.score = validateScores(rawEvaluation.score);
        rawEvaluation.score.overall = calculateOverallScore(rawEvaluation.score);
    }

    return {
        score: rawEvaluation.score,
        feedback: rawEvaluation.feedback,
        improvedAnswer: rawEvaluation.improvedAnswer || rawEvaluation.betterAnswer,
        isFollowUpNeeded: rawEvaluation.isFollowUpNeeded || false
    };
}
