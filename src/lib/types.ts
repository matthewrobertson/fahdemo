
export interface User {
  id: string;
  name: string;
}

export interface Question {
  id: string;
  text: string;
  order: number;
}

export interface Answer {
  id: string;
  questionId: string;
  userId: string; // ID of the user who provided the answer
  text: string;
  submittedAt: string; // ISO date string
}

export interface Questionnaire {
  id: string;
  title: string;
  questions: Question[];
  createdAt: string; // ISO date string
  creatorId?: string; // Optional: ID of the user who created it
}

export interface SubmittedAnswer {
  questionId: string;
  text: string;
}

export interface UserAnswers {
  userId: string;
  userName: string;
  questionnaireId: string;
  answers: SubmittedAnswer[];
  submittedAt: string; // ISO date string
}

export interface GameAttempt {
  id: string;
  questionnaireId: string;
  questionId: string;
  playerId: string; // ID of the user playing
  playerName?: string;
  matches: { answerId: string; guessedUserId: string | null }[]; // User's guesses
  score: number;
  playedAt: string; // ISO date string
}

export interface PlayerScore {
  playerId: string;
  playerName: string;
  totalScore: number;
}
