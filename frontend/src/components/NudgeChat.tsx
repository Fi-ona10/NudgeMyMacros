// @ts-nocheck
import { useState, useRef, useEffect } from "react";

const ONBOARDING_STEPS = {
  GOAL: "goal",
  HUNGER_SCALE: "hunger_scale",
  DONE: "done",
};

const GOALS = [
  { id: 1, emoji: "💪", label: "Build muscle & get stronger" },
  { id: 2, emoji: "🔥", label: "Lose body fat" },
  { id: 3, emoji: "🥗", label: "Eat more consistently / fix my habits" },
  { id: 4, emoji: "⚡", label: "Have more energy throughout the day" },
  { id: 5, emoji: "✨", label: "Something else" },
];

const HUNGER_SCALE = [
  { id: 1, color: "bg-green-500", emoji: "🟢", label: "Completely full, couldn't eat more" },
  { id: 2, color: "bg-lime-400", emoji: "🟡", label: "Satisfied, don't need more" },
  { id: 3, color: "bg-yellow-400", emoji: "🟠", label: "Neutral, could eat a little more" },
  { id: 4, color: "bg-orange-500", emoji: "🔴", label: "Still hungry" },
  { id: 5, color: "bg-red-600", emoji: "🔴", label: "Very hungry, meal wasn't enough" },
];

const MacroBadge = ({ label, value, color }) => (
  <div className={`flex flex-col items-center px-4 py-2 rounded-2xl ${color}`}>
    <span className="text-xs font-semibold uppercase tracking-widest opacity-70">{label}</span>
    <span className="text-lg font-bold">{value}</span>
  </div>
);

const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-4 py-3 bg-white/10 rounded-2xl w-fit">
    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
  </div>
);

const MealAnalysisCard = ({ foods, macros, nudge }) => (
  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5 space-y-4 max-w-sm">
    <div>
      <p className="text-xs uppercase tracking-widest text-emerald-300 font-semibold mb-2">🍽️ What I see</p>
      <ul className="space-y-1">
        {foods.map((f, i) => (
          <li key={i} className="text-sm text-white/90 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            {f}
          </li>
        ))}
      </ul>
    </div>
    <div>
      <p className="text-xs uppercase tracking-widest text-emerald-300 font-semibold mb-2">📊 Your macros</p>
      <div className="grid grid-cols-4 gap-2">
        <MacroBadge label="Protein" value={`${macros.protein}g`} color="bg-emerald-500/30 text-emerald-100" />
        <MacroBadge label="Carbs" value={`${macros.carbs}g`} color="bg-sky-500/30 text-sky-100" />
        <MacroBadge label="Fat" value={`${macros.fat}g`} color="bg-amber-500/30 text-amber-100" />
        <MacroBadge label="kcal" value={macros.calories} color="bg-purple-500/30 text-purple-100" />
      </div>
    </div>
    {nudge && (
      <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-2xl px-4 py-3">
        <p className="text-xs uppercase tracking-widest text-emerald-300 font-semibold mb-1">💬 Your nudge</p>
        <p className="text-sm text-white/90 leading-relaxed">{nudge}</p>
      </div>
    )}
  </div>
);

const ChatBubble = ({ role, children, image }) => {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} gap-3 items-end`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-sm font-bold text-white shadow-lg flex-shrink-0">
          N
        </div>
      )}
      <div
        className={`max-w-xs md:max-w-sm lg:max-w-md rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-md
          ${isUser
            ? "bg-emerald-500 text-white rounded-br-sm"
            : "bg-white/10 backdrop-blur-md border border-white/20 text-white/90 rounded-bl-sm"
          }`}
      >
        {image && (
          <img src={image} alt="Meal" className="rounded-2xl mb-2 w-full object-cover max-h-52" />
        )}
        {children}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-sm font-bold text-white shadow-lg flex-shrink-0">
          Y
        </div>
      )}
    </div>
  );
};

const MOCK_MEAL_RESPONSE = {
  foods: ["Grilled chicken breast (likely)", "Steamed broccoli", "White rice – large portion"],
  macros: { protein: 42, carbs: 90, fat: 20, calories: 740 },
  nudge: "Swap half the white rice for quinoa to keep the same volume but boost your protein and lasting energy — perfect for your muscle goal! 💪",
};

export default function NudgeMyMacros() {
  const [onboardingStep, setOnboardingStep] = useState(ONBOARDING_STEPS.GOAL);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      type: "text",
      content:
        "Hey! 👋 I'm Nudge — I'll analyze your meals and give you one small, easy nudge after each one. Before we start, two quick things:\n\n**What's your main goal right now?**",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [awaitingHunger, setAwaitingHunger] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showHungerPicker, setShowHungerPicker] = useState(false);
  const bottomRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const pushMessage = (msg) => setMessages((prev) => [...prev, msg]);

  const simulateTyping = (callback, delay = 1400) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, delay);
  };

  const handleGoalSelect = (goal) => {
    setSelectedGoal(goal);
    pushMessage({ role: "user", type: "text", content: `${goal.emoji} ${goal.label}` });
    simulateTyping(() => {
      pushMessage({
        role: "assistant",
        type: "text",
        content:
          `Perfect! **${goal.label}** — I've got you. 🎯\n\nAnd one last thing — after each meal you log, I'll ask you to rate your hunger:\n\n🟢 1 — Completely full\n🟡 2 — Satisfied\n🟠 3 — Neutral\n🔴 4 — Still hungry\n🔴 5 — Very hungry\n\nThat's it — now upload your first meal photo whenever you're ready! 📸`,
      });
      setOnboardingStep(ONBOARDING_STEPS.DONE);
    });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
    pushMessage({ role: "user", type: "image", content: "Here's my meal!", image: url });
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      pushMessage({
        role: "assistant",
        type: "analysis",
        analysis: MOCK_MEAL_RESPONSE,
        content: "Great meal snap! Here's what I found 👇",
      });
      setTimeout(() => {
        pushMessage({
          role: "assistant",
          type: "text",
          content: "❓ **How full are you?** Rate 1–5 using the scale above — just tap below!",
        });
        setAwaitingHunger(true);
        setShowHungerPicker(true);
      }, 600);
    }, 2000);
    e.target.value = "";
  };

  const handleHungerSelect = (h) => {
    setShowHungerPicker(false);
    setAwaitingHunger(false);
    pushMessage({ role: "user", type: "text", content: `${h.emoji} ${h.id} — ${h.label}` });
    simulateTyping(() => {
      pushMessage({
        role: "assistant",
        type: "text",
        content:
          h.id >= 4
            ? "Got it — sounds like this meal wasn't quite enough. Next time try adding a palm-sized protein source to keep hunger at bay longer. You're doing great logging this! 🙌"
            : "Awesome — sounds like a solid meal! Keep it up and log your next one when you're ready 📸",
      });
    });
  };

  const handleSendText = () => {
    if (!inputText.trim()) return;
    pushMessage({ role: "user", type: "text", content: inputText });
    setInputText("");
    simulateTyping(() => {
      pushMessage({
        role: "assistant",
        type: "text",
        content: "Got it! Feel free to upload a meal photo whenever you're ready and I'll give you your macros and nudge. 📸",
      });
    });
  };

  const renderMessage = (msg, i) => {
    if (msg.type === "analysis") {
      return (
        <div key={i} className="flex flex-col gap-2 items-start">
          <ChatBubble role="assistant">
            <span>{msg.content}</span>
          </ChatBubble>
          <div className="ml-11">
            <MealAnalysisCard
              foods={msg.analysis.foods}
              macros={msg.analysis.macros}
              nudge={null}
            />
          </div>
        </div>
      );
    }
    return (
      <ChatBubble key={i} role={msg.role} image={msg.image}>
        <span className="whitespace-pre-line">{msg.content}</span>
      </ChatBubble>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 backdrop-blur-md bg-white/5 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
            N
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight">NudgeMyMacros</h1>
            <p className="text-emerald-400 text-xs font-medium">Your personal nutrition coach</p>
          </div>
        </div>
        {selectedGoal && (
          <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1.5">
            <span className="text-sm">{selectedGoal.emoji}</span>
            <span className="text-white/70 text-xs font-medium hidden sm:block">{selectedGoal.label}</span>
          </div>
        )}
      </header>

      {/* Stats bar - only after onboarding */}
      {onboardingStep === ONBOARDING_STEPS.DONE && (
        <div className="flex items-center gap-4 px-6 py-3 bg-white/5 border-b border-white/10 overflow-x-auto">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/60 text-xs">Today</span>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full px-3 py-1 font-semibold">Protein: 42g</span>
            <span className="text-xs bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-full px-3 py-1 font-semibold">Carbs: 90g</span>
            <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full px-3 py-1 font-semibold">Fat: 20g</span>
            <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full px-3 py-1 font-semibold">740 kcal</span>
          </div>
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-2xl w-full mx-auto">
        {messages.map((msg, i) => renderMessage(msg, i))}
        {isTyping && (
          <div className="flex items-end gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-sm font-bold text-white shadow-lg flex-shrink-0">
              N
            </div>
            <TypingIndicator />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Goal picker */}
      {onboardingStep === ONBOARDING_STEPS.GOAL && (
        <div className="px-4 pb-4 max-w-2xl w-full mx-auto">
          <div className="grid grid-cols-1 gap-2">
            {GOALS.map((g) => (
              <button
                key={g.id}
                onClick={() => handleGoalSelect(g)}
                className="flex items-center gap-3 bg-white/10 hover:bg-emerald-500/30 border border-white/20 hover:border-emerald-400/50 text-white rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 text-left"
              >
                <span className="text-xl">{g.emoji}</span>
                <span>{g.id}️⃣ {g.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hunger picker */}
      {showHungerPicker && (
        <div className="px-4 pb-4 max-w-2xl w-full mx-auto">
          <p className="text-white/50 text-xs text-center mb-3 uppercase tracking-widest font-semibold">How full are you?</p>
          <div className="grid grid-cols-5 gap-2">
            {HUNGER_SCALE.map((h) => (
              <button
                key={h.id}
                onClick={() => handleHungerSelect(h)}
                className="flex flex-col items-center gap-1 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-2xl px-2 py-3 transition-all duration-200"
              >
                <span className="text-xl">{h.emoji}</span>
                <span className="text-white font-bold text-sm">{h.id}</span>
                <span className="text-white/50 text-xs text-center leading-tight hidden sm:block">{h.label.split(",")[0]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      {onboardingStep === ONBOARDING_STEPS.DONE && !showHungerPicker && (
        <div className="px-4 pb-6 pt-2 max-w-2xl w-full mx-auto">
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl px-4 py-3">
            <button
              onClick={() => fileRef.current?.click()}
              className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white shadow-md hover:scale-105 transition-transform flex-shrink-0"
              title="Upload meal photo"
            >
              📸
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendText()}
              placeholder="Ask Nudge anything…"
              className="flex-1 bg-transparent text-white placeholder-white/40 text-sm outline-none"
            />
            <button
              onClick={handleSendText}
              disabled={!inputText.trim()}
              className="w-10 h-10 rounded-2xl bg-emerald-500 disabled:bg-white/10 flex items-center justify-center text-white shadow-md hover:bg-emerald-400 disabled:cursor-not-allowed transition-all flex-shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
          <p className="text-center text-white/30 text-xs mt-2">📸 Tap the camera to log a meal</p>
        </div>
      )}
    </div>
  );
}