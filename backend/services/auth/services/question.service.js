import { generateQuestion, generateFollowUp } from "./llm.service.js";

export async function getNextQuestion({ role, level, skills, category, difficulty, questionNumber, previousQuestions }) {
    const question = await generateQuestion({
        role,
        level,
        skills,
        category,
        difficulty,
        questionNumber,
        previousQuestions
    });
    return question.trim();
}

export async function getFollowUpQuestion({ role, level, question, answer, feedback }) {
    const followUp = await generateFollowUp({
        role,
        level,
        question,
        answer,
        feedback
    });
    return followUp.trim();
}
