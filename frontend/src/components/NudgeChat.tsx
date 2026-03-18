// @ts-nocheck
import { useState, useRef, useEffect } from "react";

const GOALS = [
  { id: 1, emoji: "💪", label: "Build muscle & get stronger" },
  { id: 2, emoji: "🔥", label: "Lose body fat" },
  { id: 3, emoji: "🥗", label: "Eat more consistently / fix my habits" },
  { id: 4, emoji: "⚡", label: "Have more energy throughout the day" },
  { id: 5, emoji: "✨", label: "Something else" },
];

const HUNGER_SCALE = [
  { id: 1, emoji: "🟢", label: "Completely full" },
  { id: 2, emoji: "🟡", label: "Satisfied" },
  { id: 3, emoji: "🟠", label: "Neutral" },
  { id: 4, emoji: "🔴", label: "Still hungry" },
  { id: 5, emoji: "🔴", label: "Very hungry" },
];

const MOCK_MEAL_RESPONSE = {
  foods: ["Grilled chicken breast (likely)", "Steamed broccoli", "White rice - large portion"],
  macros: { protein: 42, carbs: 90, fat: 20, calories: 740 },
  nudge: "Swap half the white rice for quinoa to keep the same volume but boost your protein and lasting energy - perfect for your muscle goal!",
};

const s = {
  app: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #134e4a 100%)",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    color: "#f1f5f9",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 24px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(12px)",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 12 },
  avatar: {
    width: 38, height: 38, borderRadius: 12,
    background: "linear-gradient(135deg, #34d399, #0d9488)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 900, fontSize: 18, color: "#fff",
    boxShadow: "0 4px 12px rgba(52,211,153,0.4)", flexShrink: 0,
  },
  appName: { fontWeight: 800, fontSize: 15, lineHeight: 1.2 },
  appSub: { fontSize: 11, color: "#34d399", fontWeight: 500 },
  goalPill: {
    display: "flex", alignItems: "center", gap: 6,
    background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 999, padding: "6px 14px", fontSize: 12, color: "rgba(255,255,255,0.8)",
  },
  statsBar: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "10px 24px", background: "rgba(255,255,255,0.04)",
    borderBottom: "1px solid rgba(255,255,255,0.08)", overflowX: "auto",
  },
  statDot: { width: 8, height: 8, borderRadius: "50%", background: "#34d399" },
  statBadgeGreen: {
    fontSize: 11, background: "rgba(52,211,153,0.15)", color: "#6ee7b7",
    border: "1px solid rgba(52,211,153,0.3)", borderRadius: 999,
    padding: "4px 12px", fontWeight: 700, whiteSpace: "nowrap",
  },
  statBadgeBlue: {
    fontSize: 11, background: "rgba(56,189,248,0.15)", color: "#7dd3fc",
    border: "1px solid rgba(56,189,248,0.3)", borderRadius: 999,
    padding: "4px 12px", fontWeight: 700, whiteSpace: "nowrap",
  },
  statBadgeYellow: {
    fontSize: 11, background: "rgba(251,191,36,0.15)", color: "#fde68a",
    border: "1px solid rgba(251,191,36,0.3)", borderRadius: 999,
    padding: "4px 12px", fontWeight: 700, whiteSpace: "nowrap",
  },
  statBadgePurple: {
    fontSize: 11, background: "rgba(167,139,250,0.15)", color: "#c4b5fd",
    border: "1px solid rgba(167,139,250,0.3)", borderRadius: 999,
    padding: "4px 12px", fontWeight: 700, whiteSpace: "nowrap",
  },
  chatArea: {
    flex: 1, overflowY: "auto", padding: "24px 16px",
    display: "flex", flexDirection: "column", gap: 16,
    maxWidth: 680, width: "100%", margin: "0 auto",
  },
  bubbleRowUser: {
    display: "flex", justifyContent: "flex-end",
    alignItems: "flex-end", gap: 10,
  },
  bubbleRowBot: {
    display: "flex", justifyContent: "flex-start",
    alignItems: "flex-end", gap: 10,
  },
  avatarUser: {
    width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
    background: "linear-gradient(135deg, #64748b, #334155)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: 13, color: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
  },
  avatarBot: {
    width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
    background: "linear-gradient(135deg, #34d399, #0d9488)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: 13, color: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
  },
  bubbleUser: {
    maxWidth: 320, borderRadius: "20px 20px 4px 20px",
    padding: "10px 14px", fontSize: 13.5, lineHeight: 1.6,
    background: "linear-gradient(135deg, #10b981, #0d9488)",
    color: "#f1f5f9", whiteSpace: "pre-line",
    boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
  },
  bubbleBot: {
    maxWidth: 320, borderRadius: "20px 20px 20px 4px",
    padding: "10px 14px", fontSize: 13.5, lineHeight: 1.6,
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.15)",
    color: "#f1f5f9", whiteSpace: "pre-line",
    boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
  },
  mealImg: {
    width: "100%", borderRadius: 14, marginBottom: 8,
    maxHeight: 200, objectFit: "cover", display: "block",
  },
  analysisCard: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 20, padding: 16,
    display: "flex", flexDirection: "column", gap: 14,
    maxWidth: 320, marginLeft: 42,
  },
  sectionLabel: {
    fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
    textTransform: "uppercase", color: "#34d399", marginBottom: 6,
    display: "block",
  },
  foodItem: {
    display: "flex", alignItems: "center", gap: 8,
    fontSize: 13, color: "rgba(255,255,255,0.85)", marginBottom: 3,
  },
  foodDot: {
    width: 6, height: 6, borderRadius: "50%",
    background: "#34d399", flexShrink: 0,
  },
  macroGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 },
  macroBadgeProtein: {
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "8px 4px", borderRadius: 12,
    background: "rgba(52,211,153,0.2)", color: "#6ee7b7",
  },
  macroBadgeCarbs: {
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "8px 4px", borderRadius: 12,
    background: "rgba(56,189,248,0.2)", color: "#7dd3fc",
  },
  macroBadgeFat: {
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "8px 4px", borderRadius: 12,
    background: "rgba(251,191,36,0.2)", color: "#fde68a",
  },
  macroBadgeKcal: {
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "8px 4px", borderRadius: 12,
    background: "rgba(167,139,250,0.2)", color: "#c4b5fd",
  },
  macroLabel: { fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", opacity: 0.75 },
  macroValue: { fontSize: 15, fontWeight: 800, marginTop: 2 },
  nudgeBox: {
    background: "rgba(52,211,153,0.15)",
    border: "1px solid rgba(52,211,153,0.3)",
    borderRadius: 14, padding: "10px 14px",
  },
  nudgeLabel: { fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#34d399", display: "block", marginBottom: 4 },
  nudgeText: { fontSize: 13, color: "rgba(255,255,255,0.9)", lineHeight: 1.6 },
  typingRow: { display: "flex", alignItems: "flex-end", gap: 10 },
  typingBubble: {
    display: "flex", alignItems: "center", gap: 5,
    background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "20px 20px 20px 4px", padding: "12px 16px",
  },
  goalGrid: {
    display: "flex", flexDirection: "column", gap: 8,
    padding: "0 16px 16px", maxWidth: 680, width: "100%", margin: "0 auto",
  },
  goalBtn: {
    display: "flex", alignItems: "center", gap: 12,
    background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 16, padding: "12px 16px", color: "#f1f5f9",
    fontSize: 13.5, fontWeight: 500, cursor: "pointer", textAlign: "left",
    transition: "all 0.2s",
  },
  hungerGrid: {
    display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8,
    padding: "0 16px 16px", maxWidth: 680, width: "100%", margin: "0 auto",
  },
  hungerBtn: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
    background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 16, padding: "12px 6px", cursor: "pointer", color: "#f1f5f9",
    transition: "all 0.2s",
  },
  hungerNum: { fontWeight: 800, fontSize: 16 },
  hungerLabel: { fontSize: 10, color: "rgba(255,255,255,0.5)", textAlign: "center", lineHeight: 1.3 },
  inputBar: {
    padding: "12px 16px 24px", maxWidth: 680, width: "100%", margin: "0 auto",
  },
  inputInner: {
    display: "flex", alignItems: "center", gap: 10,
    background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 999, padding: "8px 8px 8px 16px",
    backdropFilter: "blur(12px)",
  },
  textInput: {
    flex: 1, background: "transparent", border: "none", outline: "none",
    color: "#f1f5f9", fontSize: 14,
  },
  camBtn: {
    width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
    background: "linear-gradient(135deg, #34d399, #0d9488)",
    border: "none", cursor: "pointer", fontSize: 18,
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 2px 8px rgba(52,211,153,0.4)",
  },
  sendBtnActive: {
    width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
    background: "#10b981", border: "none", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  sendBtnInactive: {
    width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
    background: "rgba(255,255,255,0.1)", border: "none", cursor: "default",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  hint: { textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 6 },
};

const TypingIndicator = () => (
  <div style={s.typingRow}>
    <div style={s.avatarBot}>N</div>
    <div style={s.typingBubble}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399", display: "inline-block", animation: "bounce 1.2s infinite", animationDelay: "0ms" }} />
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399", display: "inline-block", animation: "bounce 1.2s infinite", animationDelay: "150ms" }} />
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399", display: "inline-block", animation: "bounce 1.2s infinite", animationDelay: "300ms" }} />
    </div>
  </div>
);

const MealAnalysisCard = ({ foods, macros, nudge }) => (
  <div style={s.analysisCard}>
    <div>
      <span style={s.sectionLabel}>What I see</span>
      {foods.map((f, i) => (
        <div key={i} style={s.foodItem}>
          <span style={s.foodDot} />
          {f}
        </div>
      ))}
    </div>
    <div>
      <span style={s.sectionLabel}>Your macros</span>
      <div style={s.macroGrid}>
        <div style={s.macroBadgeProtein}>
          <span style={s.macroLabel}>Protein</span>
          <span style={s.macroValue}>{macros.protein}g</span>
        </div>
        <div style={s.macroBadgeCarbs}>
          <span style={s.macroLabel}>Carbs</span>
          <span style={s.macroValue}>{macros.carbs}g</span>
        </div>
        <div style={s.macroBadgeFat}>
          <span style={s.macroLabel}>Fat</span>
          <span style={s.macroValue}>{macros.fat}g</span>
        </div>
        <div style={s.macroBadgeKcal}>
          <span style={s.macroLabel}>kcal</span>
          <span style={s.macroValue}>{macros.calories}</span>
        </div>
      </div>
    </div>
    {nudge && (
      <div style={s.nudgeBox}>
        <span style={s.nudgeLabel}>Your nudge</span>
        <p style={s.nudgeText}>{nudge}</p>
      </div>
    )}
  </div>
);

export default function NudgeMyMacros() {
  const [step, setStep] = useState("goal");
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      type: "text",
      content: "Hey! I'm Nudge - I'll analyze your meals and give you one small, easy nudge after each one.\n\nWhat's your main goal right now?",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showHunger, setShowHunger] = useState(false);
  const bottomRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const push = (msg) => setMessages((p) => [...p, msg]);

  const simulateTyping = (cb, delay = 1400) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      cb();
    }, delay);
  };

  const handleGoalSelect = (goal) => {
    setSelectedGoal(goal);
    push({ role: "user", type: "text", content: goal.emoji + " " + goal.label });
    simulateTyping(() => {
      push({
        role: "assistant",
        type: "text",
        content: "Perfect! " + goal.label + " - I've got you.\n\nAfter each meal, I'll ask you to rate your hunger:\n\n1 - Completely full\n2 - Satisfied\n3 - Neutral\n4 - Still hungry\n5 - Very hungry\n\nNow upload your first meal photo whenever you're ready!",
      });
      setStep("done");
    });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    push({ role: "user", type: "image", content: "Here's my meal!", image: url });
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      push({
        role: "assistant",
        type: "analysis",
        analysis: MOCK_MEAL_RESPONSE,
        content: "Great snap! Here's what I found",
      });
      setTimeout(() => {
        push({ role: "assistant", type: "text", content: "How full are you? Tap a number below!" });
        setShowHunger(true);
      }, 600);
    }, 2000);
    e.target.value = "";
  };

  const handleHungerSelect = (h) => {
    setShowHunger(false);
    push({ role: "user", type: "text", content: h.emoji + " " + h.id + " - " + h.label });
    simulateTyping(() => {
      if (h.id >= 4) {
        push({
          role: "assistant",
          type: "text",
          content: "Got it - this meal wasn't quite enough. Next time try adding a palm-sized protein source to stay fuller longer. You're doing great!",
        });
      } else {
        push({
          role: "assistant",
          type: "text",
          content: "Awesome - solid meal! Here's your nudge:\n\n" + MOCK_MEAL_RESPONSE.nudge,
        });
      }
    });
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    push({ role: "user", type: "text", content: inputText });
    setInputText("");
    simulateTyping(() => {
      push({
        role: "assistant",
        type: "text",
        content: "Got it! Upload a meal photo whenever you're ready and I'll give you your macros and nudge.",
      });
    });
  };

  const renderMessage = (msg, i) => {
    if (msg.type === "analysis") {
      return (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={s.bubbleRowBot}>
            <div style={s.avatarBot}>N</div>
            <div style={s.bubbleBot}>{msg.content}</div>
          </div>
          <MealAnalysisCard
            foods={msg.analysis.foods}
            macros={msg.analysis.macros}
            nudge={msg.analysis.nudge}
          />
        </div>
      );
    }
    if (msg.role === "user") {
      return (
        <div key={i} style={s.bubbleRowUser}>
          <div style={s.bubbleUser}>
            {msg.image && <img src={msg.image} alt="Meal" style={s.mealImg} />}
            {msg.content}
          </div>
          <div style={s.avatarUser}>Y</div>
        </div>
      );
    }
    return (
      <div key={i} style={s.bubbleRowBot}>
        <div style={s.avatarBot}>N</div>
        <div style={s.bubbleBot}>{msg.content}</div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        button:hover { opacity: 0.85; }
        input::placeholder { color: rgba(255,255,255,0.35); }
      `}</style>

      <div style={s.app}>

        <header style={s.header}>
          <div style={s.headerLeft}>
            <div style={s.avatar}>N</div>
            <div>
              <div style={s.appName}>NudgeMyMacros</div>
              <div style={s.appSub}>Your personal nutrition coach</div>
            </div>
          </div>
          {selectedGoal && (
            <div style={s.goalPill}>
              <span>{selectedGoal.emoji}</span>
              <span>{selectedGoal.label}</span>
            </div>
          )}
        </header>

        {step === "done" && (
          <div style={s.statsBar}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <div style={s.statDot} />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Today</span>
            </div>
            <div style={s.statBadgeGreen}>Protein: 42g</div>
            <div style={s.statBadgeBlue}>Carbs: 90g</div>
            <div style={s.statBadgeYellow}>Fat: 20g</div>
            <div style={s.statBadgePurple}>740 kcal</div>
          </div>
        )}

        <div style={s.chatArea}>
          {messages.map((msg, i) => renderMessage(msg, i))}
          {isTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {step === "goal" && (
          <div style={s.goalGrid}>
            {GOALS.map((g) => (
              <button key={g.id} style={s.goalBtn} onClick={() => handleGoalSelect(g)}>
                <span style={{ fontSize: 20 }}>{g.emoji}</span>
                <span>{g.id}. {g.label}</span>
              </button>
            ))}
          </div>
        )}

        {showHunger && (
          <div style={{ padding: "0 16px 16px", maxWidth: 680, width: "100%", margin: "0 auto" }}>
            <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 10, letterSpacing: 1.5, textTransform: "uppercase" }}>
              How full are you?
            </p>
            <div style={s.hungerGrid}>
              {HUNGER_SCALE.map((h) => (
                <button key={h.id} style={s.hungerBtn} onClick={() => handleHungerSelect(h)}>
                  <span style={{ fontSize: 22 }}>{h.emoji}</span>
                  <span style={s.hungerNum}>{h.id}</span>
                  <span style={s.hungerLabel}>{h.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "done" && !showHunger && (
          <div style={s.inputBar}>
            <div style={s.inputInner}>
              <button style={s.camBtn} onClick={() => fileRef.current?.click()}>
                Cam
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handlePhotoUpload}
              />
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask Nudge anything..."
                style={s.textInput}
              />
              <button
                style={inputText.trim() ? s.sendBtnActive : s.sendBtnInactive}
                onClick={handleSend}
                disabled={!inputText.trim()}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <p style={s.hint}>Tap the camera button to log a meal</p>
          </div>
        )}

      </div>
    </>
  );
}
