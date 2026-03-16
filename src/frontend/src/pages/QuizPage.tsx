import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Progress } from "../components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";

interface Question {
  id: string;
  text: string;
  options: string[];
}

const CATEGORIES: {
  id: string;
  label: string;
  emoji: string;
  questions: Question[];
}[] = [
  {
    id: "personality",
    label: "Personality",
    emoji: "🧠",
    questions: [
      {
        id: "p1",
        text: "How do you recharge?",
        options: [
          "Alone time",
          "With friends",
          "Nature walks",
          "Creative hobbies",
        ],
      },
      {
        id: "p2",
        text: "Your love language is?",
        options: [
          "Words of affirmation",
          "Acts of service",
          "Physical touch",
          "Quality time",
        ],
      },
      {
        id: "p3",
        text: "You're most like?",
        options: [
          "The planner",
          "The adventurer",
          "The nurturer",
          "The dreamer",
        ],
      },
    ],
  },
  {
    id: "preferences",
    label: "Preferences",
    emoji: "💫",
    questions: [
      {
        id: "pr1",
        text: "Perfect date night?",
        options: [
          "Cozy dinner at home",
          "Movie night",
          "Stargazing",
          "Dancing",
        ],
      },
      {
        id: "pr2",
        text: "Favourite season?",
        options: ["Spring", "Summer", "Autumn", "Winter"],
      },
      {
        id: "pr3",
        text: "Dream vacation?",
        options: ["Beach", "Mountains", "City trip", "Road trip"],
      },
    ],
  },
  {
    id: "memories",
    label: "Memories",
    emoji: "📸",
    questions: [
      {
        id: "m1",
        text: "Best time of day?",
        options: ["Early morning", "Afternoon", "Golden hour", "Late night"],
      },
      {
        id: "m2",
        text: "What makes a moment unforgettable?",
        options: [
          "Laughter",
          "Deep talks",
          "Shared food",
          "Just being together",
        ],
      },
      {
        id: "m3",
        text: "Your happy place is?",
        options: [
          "A cozy room",
          "By the sea",
          "In someone's arms",
          "Any new place",
        ],
      },
    ],
  },
  {
    id: "lifestyle",
    label: "Lifestyle",
    emoji: "🌿",
    questions: [
      {
        id: "l1",
        text: "Morning routine?",
        options: [
          "Coffee & slow mornings",
          "Gym first",
          "Check phone immediately",
          "Meditate",
        ],
      },
      {
        id: "l2",
        text: "Friday night plans?",
        options: [
          "Stay in & watch TV",
          "Go out with friends",
          "Cook something special",
          "Read a book",
        ],
      },
      {
        id: "l3",
        text: "Comfort food?",
        options: ["Pizza", "Rice & curry", "Noodles", "Ice cream"],
      },
    ],
  },
];

const STORAGE_KEY = "twoverse_quiz_answers";

function loadAnswers(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAnswers(answers: Record<string, string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
}

function calcScore(answers: Record<string, string>): number {
  const total = CATEGORIES.reduce((acc, c) => acc + c.questions.length, 0);
  const answered = Object.keys(answers).length;
  if (answered === 0) return 0;
  // Fun algorithm: answered percentage + bonus for consistent option indices
  const indices = Object.values(answers).map((a) => {
    for (const cat of CATEGORIES) {
      for (const q of cat.questions) {
        const idx = q.options.indexOf(a);
        if (idx !== -1) return idx;
      }
    }
    return -1;
  });
  const avgIdx =
    indices.filter((i) => i >= 0).reduce((a, b) => a + b, 0) /
    (indices.filter((i) => i >= 0).length || 1);
  const bonusFactor = 1 - Math.abs(avgIdx - 1.5) / 3; // closer to middle = more "compatible"
  const base = (answered / total) * 75;
  return Math.min(99, Math.round(base + bonusFactor * 25));
}

export function QuizPage() {
  const [answers, setAnswers] = useState<Record<string, string>>(loadAnswers);
  const [customQ, setCustomQ] = useState("");
  const [customQs, setCustomQs] = useState<string[]>([]);

  const selectAnswer = (qId: string, option: string) => {
    const next = { ...answers, [qId]: option };
    setAnswers(next);
    saveAnswers(next);
  };

  const addCustomQ = () => {
    if (!customQ.trim()) return;
    setCustomQs((prev) => [...prev, customQ.trim()]);
    setCustomQ("");
  };

  const score = calcScore(answers);
  const allCount = CATEGORIES.reduce((a, c) => a + c.questions.length, 0);
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="px-4 py-5 max-w-lg mx-auto flex flex-col gap-5">
      {/* Score */}
      <div
        data-ocid="quiz.score_card"
        className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-6 text-center border border-blue-100 shadow-soft"
      >
        <div className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-2">
          Compatibility
        </div>
        <div className="text-6xl font-bold text-blue-500 font-serif">
          {score}%
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {answeredCount} / {allCount} questions answered
        </div>
        <Progress value={score} className="mt-3 h-2" />
        <p className="text-xs text-blue-500 font-serif italic mt-2">
          {score >= 80
            ? "Incredibly compatible! 💕"
            : score >= 60
              ? "Great connection forming! 💫"
              : score >= 40
                ? "Getting to know each other 🌱"
                : "Just getting started! 🌸"}
        </p>
      </div>

      {/* Category tabs */}
      <Tabs defaultValue="personality">
        <TabsList
          data-ocid="quiz.category_tab"
          className="w-full grid grid-cols-4 h-auto bg-pink-50 rounded-2xl p-1"
        >
          {CATEGORIES.map((cat) => (
            <TabsTrigger
              key={cat.id}
              value={cat.id}
              className="flex flex-col gap-0.5 py-2 text-xs rounded-xl data-[state=active]:bg-white data-[state=active]:text-pink-500 data-[state=active]:shadow-sm"
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {CATEGORIES.map((cat) => (
          <TabsContent
            key={cat.id}
            value={cat.id}
            className="mt-4 flex flex-col gap-4"
          >
            {cat.questions.map((q, qi) => (
              <div
                key={q.id}
                data-ocid={`quiz.question.item.${qi + 1}`}
                className="bg-white rounded-2xl p-4 shadow-soft border border-pink-100"
              >
                <p className="text-sm font-semibold text-foreground mb-3">
                  {qi + 1}. {q.text}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {q.options.map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => selectAnswer(q.id, opt)}
                      className={`text-xs py-2 px-3 rounded-xl border text-left transition-all duration-150 ${
                        answers[q.id] === opt
                          ? "bg-pink-100 border-pink-400 text-pink-700 font-semibold"
                          : "bg-gray-50 border-gray-200 text-foreground hover:border-pink-300 hover:bg-pink-50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>
        ))}
      </Tabs>

      {/* Custom questions */}
      <div className="bg-white rounded-2xl p-5 shadow-soft border border-pink-100">
        <div className="text-xs font-semibold text-pink-400 uppercase tracking-widest mb-3">
          Add a Question
        </div>
        <div className="flex gap-2">
          <Input
            data-ocid="quiz.custom_question_input"
            value={customQ}
            onChange={(e) => setCustomQ(e.target.value)}
            placeholder="What's your question?"
            className="rounded-xl border-pink-200 flex-1"
            onKeyDown={(e) => e.key === "Enter" && addCustomQ()}
          />
          <Button
            data-ocid="quiz.add_question_button"
            onClick={addCustomQ}
            size="sm"
            className="bg-pink-400 hover:bg-pink-500 text-white rounded-xl"
          >
            Add
          </Button>
        </div>
        {customQs.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {customQs.map((q, i) => (
              <div
                key={q}
                data-ocid={`quiz.custom_question.item.${i + 1}`}
                className="text-sm text-foreground bg-pink-50 rounded-xl px-3 py-2"
              >
                💬 {q}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
