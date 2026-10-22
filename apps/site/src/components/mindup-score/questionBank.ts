// MIND UP™ ASSESSMENT — 48-Question Alternative Bank
// 12 questions per assessment · 6 dimensions · 4 versions per question

export type PillarId = "M" | "I" | "N" | "D" | "U" | "P";

export type QuestionGroup = {
  id: string;
  pillarId: PillarId;
  pillarName: string;
  theme: string;
  versions: [string, string, string, string];
};

export const QUESTION_BANK: Record<string, QuestionGroup> = {
  M1: {
    id: "M1",
    pillarId: "M",
    pillarName: "Master Your Mindset",
    theme: "Managing thoughts and emotions",
    versions: [
      "I can manage my thoughts and emotions when I face challenges.",
      "I can stay emotionally balanced when situations become difficult.",
      "I can respond thoughtfully rather than react impulsively when under pressure.",
      "I can manage negative thoughts and emotions during challenging moments.",
    ],
  },
  M2: {
    id: "M2",
    pillarId: "M",
    pillarName: "Master Your Mindset",
    theme: "Learning from setbacks",
    versions: [
      "I learn from setbacks instead of allowing them to stop me.",
      "I use mistakes and failures as opportunities to learn and improve.",
      "When things do not go as planned, I look for lessons I can apply next time.",
      "I can recover from disappointments and continue moving forward.",
    ],
  },
  I1: {
    id: "I1",
    pillarId: "I",
    pillarName: "Invest in Your Health",
    theme: "Healthy habits",
    versions: [
      "I take care of my body through healthy habits such as sleep, movement and nutrition.",
      "I maintain daily habits that support my physical health and wellbeing.",
      "I make choices that help me stay physically healthy and energised.",
      "I give my body the sleep, exercise and nourishment it needs.",
    ],
  },
  I2: {
    id: "I2",
    pillarId: "I",
    theme: "Managing stress and energy",
    pillarName: "Invest in Your Health",
    versions: [
      "I make time to manage stress, recharge and protect my energy.",
      "I take regular breaks to recover when I feel mentally or physically drained.",
      "I make time for activities that help me relax and restore my energy.",
      "I recognise when I need rest and take steps to manage stress.",
    ],
  },
  N1: {
    id: "N1",
    pillarId: "N",
    pillarName: "Nurture Relationships",
    theme: "Meaningful connections",
    versions: [
      "I make meaningful time for the people who matter to me.",
      "I regularly give my family and friends quality time and attention.",
      "I make an effort to stay connected with the people I care about.",
      "I prioritise meaningful interactions with the important people in my life.",
    ],
  },
  N2: {
    id: "N2",
    pillarId: "N",
    pillarName: "Nurture Relationships",
    theme: "Communication and healthy relationships",
    versions: [
      "I communicate openly, listen well and maintain healthy relationships.",
      "I listen to others with attention and express my thoughts honestly and respectfully.",
      "I work through disagreements through respectful communication and understanding.",
      "I make an effort to understand others and build trust through honest communication.",
    ],
  },
  D1: {
    id: "D1",
    pillarId: "D",
    pillarName: "Develop Skills & Work",
    theme: "Learning and skill development",
    versions: [
      "I regularly learn and develop skills that help me grow personally or professionally.",
      "I consistently invest time in learning skills that support my growth.",
      "I actively look for opportunities to improve my knowledge and abilities.",
      "I take steps to develop skills that help me become better at what I do.",
    ],
  },
  D2: {
    id: "D2",
    pillarId: "D",
    pillarName: "Develop Skills & Work",
    theme: "Effective use of time and energy",
    versions: [
      "I use my time and energy effectively on work that matters to me.",
      "I prioritise important tasks instead of spending too much time on distractions.",
      "I organise my time to make meaningful progress toward my work and personal priorities.",
      "I focus my energy on activities that contribute to my most important goals.",
    ],
  },
  U1: {
    id: "U1",
    pillarId: "U",
    pillarName: "Unlock Yourself",
    theme: "Confidence and stepping outside your comfort zone",
    versions: [
      "I have the confidence and courage to step outside my comfort zone.",
      "I am willing to try new things even when they feel unfamiliar or uncomfortable.",
      "I take action on opportunities that challenge me to grow.",
      "I am willing to face uncertainty when it gives me a chance to develop.",
    ],
  },
  U2: {
    id: "U2",
    pillarId: "U",
    pillarName: "Unlock Yourself",
    theme: "Self-discovery and potential",
    versions: [
      "I make time to discover my strengths, interests, purpose and potential.",
      "I regularly reflect on what I am good at and what gives my life meaning.",
      "I explore my interests and abilities to better understand what I can achieve.",
      "I actively seek to understand my strengths and the possibilities for my future.",
    ],
  },
  P1: {
    id: "P1",
    pillarId: "P",
    pillarName: "Progress & Monitor",
    theme: "Goal setting and consistent action",
    versions: [
      "I set goals and take consistent action toward them.",
      "I turn my goals into practical steps and work on them regularly.",
      "I follow through on the actions needed to achieve my important goals.",
      "I make steady progress toward my goals through consistent daily effort.",
    ],
  },
  P2: {
    id: "P2",
    pillarId: "P",
    pillarName: "Progress & Monitor",
    theme: "Reviewing progress and adapting",
    versions: [
      "I regularly review my progress and adjust what I'm doing when necessary.",
      "I check whether my actions are working and make changes when needed.",
      "I reflect on my progress and use what I learn to improve my approach.",
      "I track my efforts, recognise what needs improvement and adapt my plans accordingly.",
    ],
  },
};

export const ORDERED_QUESTION_GROUPS = [
  "M1",
  "M2",
  "I1",
  "I2",
  "N1",
  "N2",
  "D1",
  "D2",
  "U1",
  "U2",
  "P1",
  "P2",
] as const;

/**
 * Randomly pick one version from a question group.
 */
function getRandomVersion(group: QuestionGroup): string {
  const idx = Math.floor(Math.random() * group.versions.length);
  return group.versions[idx];
}

/**
 * Randomly select one version from each of the 12 question groups,
 * yielding 12 questions in exact pillar order (2 questions per MIND UP dimension).
 * This shuffles question wording across assessment attempts while preserving
 * exact scoring calculations and the M-I-N-D-U-P journey flow.
 */
export function getRandomAssessmentQuestions(): string[] {
  return ORDERED_QUESTION_GROUPS.map((groupId) => {
    return getRandomVersion(QUESTION_BANK[groupId]);
  });
}
