"""
Colour Blind Mode — NeuroDev Therapy
Supports three submodes:
  - Deuteranopia (red-green blind)  → blue/yellow palette
  - Protanopia   (red weak)         → high contrast blue/orange
  - Monochromacy (full)             → greyscale, shape + size only

All status indicators use icons + text, never colour alone.
Load level indicator is shape + number based.
Quiz feedback is shape-coded, not colour-coded.
"""

import tkinter as tk
from tkinter import font as tkfont
from dataclasses import dataclass


# ─────────────────────────────────────────
#  Palette definitions per mode
# ─────────────────────────────────────────

@dataclass
class Palette:
    name: str
    bg: str           # page background
    card: str         # card / panel background
    text: str         # primary text
    text_sub: str     # secondary / muted text
    accent: str       # primary accent (buttons, highlights)
    accent2: str      # secondary accent
    correct: str      # quiz correct colour (shape-coded too)
    wrong: str        # quiz wrong colour (shape-coded too)
    border: str       # border / divider


PALETTES = {
    "deuteranopia": Palette(
        name="Deuteranopia (Blue / Yellow)",
        bg="#F5F8FF",
        card="#FFFFFF",
        text="#1A2C6B",
        text_sub="#5A6FA8",
        accent="#2563EB",      # Blue
        accent2="#F59E0B",     # Yellow
        correct="#2563EB",     # Blue — not green
        wrong="#F59E0B",       # Yellow — not red
        border="#BFCFEF",
    ),
    "protanopia": Palette(
        name="Protanopia (Blue / Orange)",
        bg="#F4F6FF",
        card="#FFFFFF",
        text="#0F172A",
        text_sub="#475569",
        accent="#1D4ED8",      # High-contrast blue
        accent2="#EA580C",     # Orange
        correct="#1D4ED8",     # Blue — not green
        wrong="#EA580C",       # Orange — not red
        border="#CBD5E1",
    ),
    "monochromacy": Palette(
        name="Monochromacy (Greyscale)",
        bg="#F2F2F2",
        card="#FFFFFF",
        text="#111111",
        text_sub="#555555",
        accent="#222222",
        accent2="#888888",
        correct="#111111",
        wrong="#888888",
        border="#CCCCCC",
    ),
}

# ─────────────────────────────────────────
#  Shape + number load level indicators
# ─────────────────────────────────────────

LEVEL_SHAPES = {
    1:  ("●", "Circle"),
    2:  ("■", "Square"),
    3:  ("▲", "Triangle"),
    4:  ("◆", "Diamond"),
    5:  ("★", "Star"),
    6:  ("⬟", "Pentagon"),
    7:  ("⬡", "Hexagon"),
    8:  ("⊕", "Cross-circle"),
    9:  ("⊞", "Grid"),
    10: ("✦", "Burst"),
}

# ─────────────────────────────────────────
#  Quiz shape coding (not colour-only)
# ─────────────────────────────────────────

QUIZ_CORRECT_SYMBOL = "✔  Correct"
QUIZ_CORRECT_SHAPE  = "▲ Triangle = Correct"

QUIZ_WRONG_SYMBOL   = "✖  Try again"
QUIZ_WRONG_SHAPE    = "■ Square = Incorrect"

# ─────────────────────────────────────────
#  Sample quiz questions
# ─────────────────────────────────────────

QUIZ = [
    {
        "question": "Which planet is closest to the Sun?",
        "options": ["Venus", "Mercury", "Earth", "Mars"],
        "answer": "Mercury",
    },
    {
        "question": "What is 7 × 8?",
        "options": ["54", "56", "64", "48"],
        "answer": "56",
    },
    {
        "question": "What colour is the sky on a clear day?",
        "options": ["Green", "Red", "Blue", "Yellow"],
        "answer": "Blue",
    },
]


# ─────────────────────────────────────────
#  Main App
# ─────────────────────────────────────────

class ColourBlindApp:
    def __init__(self, root: tk.Tk):
        self.root = root
        self.root.title("Colour Blind Mode — NeuroDev Therapy")
        self.root.geometry("900x680")
        self.root.resizable(False, False)

        self.current_mode = tk.StringVar(value="deuteranopia")
        self.load_level = tk.IntVar(value=5)
        self.quiz_index = 0
        self.score = 0

        self._build_selector()
        self._build_main()
        self._apply_palette()

    # ─── Palette selector (top bar) ──────────────────────────

    def _build_selector(self):
        self.top_bar = tk.Frame(self.root, height=56)
        self.top_bar.pack(fill="x")
        self.top_bar.pack_propagate(False)

        tk.Label(self.top_bar, text="Colour Blind Mode:", font=("Helvetica", 11, "bold")).pack(
            side="left", padx=(18, 6), pady=14
        )

        for key, pal in PALETTES.items():
            btn = tk.Radiobutton(
                self.top_bar,
                text=pal.name,
                variable=self.current_mode,
                value=key,
                command=self._apply_palette,
                font=("Helvetica", 10),
                relief="flat",
                cursor="hand2",
                indicatoron=False,
                padx=10,
                pady=6,
            )
            btn.pack(side="left", padx=4)

    # ─── Main content area ───────────────────────────────────

    def _build_main(self):
        self.main_frame = tk.Frame(self.root)
        self.main_frame.pack(fill="both", expand=True, padx=24, pady=16)

        # Left column: load level + status indicators
        self.left = tk.Frame(self.main_frame, width=220)
        self.left.pack(side="left", fill="y", padx=(0, 16))
        self.left.pack_propagate(False)

        self._build_load_indicator()
        self._build_status_panel()

        # Right column: quiz demo
        self.right = tk.Frame(self.main_frame)
        self.right.pack(side="left", fill="both", expand=True)

        self._build_quiz_panel()

    # ─── Load level indicator (shape + number, never colour only) ─

    def _build_load_indicator(self):
        self.load_card = tk.LabelFrame(
            self.left,
            text="  Load Level Indicator  ",
            font=("Helvetica", 10, "bold"),
            padx=12,
            pady=12,
        )
        self.load_card.pack(fill="x", pady=(0, 14))

        self.load_shape_label = tk.Label(
            self.load_card,
            font=("Helvetica", 48),
        )
        self.load_shape_label.pack()

        self.load_num_label = tk.Label(
            self.load_card,
            font=("Helvetica", 20, "bold"),
        )
        self.load_num_label.pack()

        self.load_name_label = tk.Label(
            self.load_card,
            font=("Helvetica", 10),
        )
        self.load_name_label.pack()

        # Slider to change load level
        tk.Label(self.load_card, text="Adjust level:", font=("Helvetica", 9)).pack(pady=(10, 2))
        self.level_slider = tk.Scale(
            self.load_card,
            from_=1,
            to=10,
            orient="horizontal",
            variable=self.load_level,
            command=lambda _: self._update_load_indicator(),
            showvalue=False,
            length=160,
        )
        self.level_slider.pack()

    def _update_load_indicator(self):
        lvl = self.load_level.get()
        shape, name = LEVEL_SHAPES[lvl]
        p = PALETTES[self.current_mode.get()]
        self.load_shape_label.config(text=shape, fg=p.accent)
        self.load_num_label.config(text=f"Level {lvl}", fg=p.text)
        self.load_name_label.config(text=f"{name} — shape #{lvl}", fg=p.text_sub)

    # ─── Status indicators (icon + text, not colour alone) ──────

    def _build_status_panel(self):
        self.status_card = tk.LabelFrame(
            self.left,
            text="  Status Indicators  ",
            font=("Helvetica", 10, "bold"),
            padx=12,
            pady=10,
        )
        self.status_card.pack(fill="x")

        self.status_items = []
        statuses = [
            ("● ON",  "Session Active",   "active"),
            ("▲ !",   "Warning",          "warning"),
            ("■ OFF", "Session Paused",   "paused"),
            ("✔ OK",  "Task Complete",    "done"),
            ("✖ ERR", "Error — retry",    "error"),
        ]

        for sym, label, key in statuses:
            row = tk.Frame(self.status_card)
            row.pack(fill="x", pady=3)
            sym_lbl = tk.Label(row, text=sym, font=("Helvetica", 12, "bold"), width=7, anchor="w")
            sym_lbl.pack(side="left")
            txt_lbl = tk.Label(row, text=label, font=("Helvetica", 10), anchor="w")
            txt_lbl.pack(side="left")
            self.status_items.append((key, sym_lbl, txt_lbl))

    def _update_status_colours(self, p: Palette):
        colour_map = {
            "active":  p.accent,
            "warning": p.accent2,
            "paused":  p.text_sub,
            "done":    p.correct,
            "error":   p.wrong,
        }
        for key, sym_lbl, txt_lbl in self.status_items:
            c = colour_map.get(key, p.text)
            sym_lbl.config(fg=c, bg=p.card)
            txt_lbl.config(fg=p.text, bg=p.card)
        self.status_card.config(bg=p.card, fg=p.text)
        for widget in self.status_card.winfo_children():
            try:
                widget.config(bg=p.card)
            except Exception:
                pass

    # ─── Quiz panel (shape-coded, not colour-coded) ─────────────

    def _build_quiz_panel(self):
        self.quiz_card = tk.LabelFrame(
            self.right,
            text="  Quiz — Shape-Coded Feedback  ",
            font=("Helvetica", 10, "bold"),
            padx=20,
            pady=16,
        )
        self.quiz_card.pack(fill="both", expand=True)

        self.q_label = tk.Label(
            self.quiz_card,
            wraplength=520,
            justify="left",
            font=("Helvetica", 16, "bold"),
            anchor="w",
        )
        self.q_label.pack(fill="x", pady=(0, 18))

        self.option_btns = []
        for i in range(4):
            btn = tk.Button(
                self.quiz_card,
                font=("Helvetica", 13),
                relief="flat",
                cursor="hand2",
                padx=12,
                pady=10,
                anchor="w",
                command=lambda idx=i: self._check_answer(idx),
            )
            btn.pack(fill="x", pady=4)
            self.option_btns.append(btn)

        # Feedback row — shape + symbol + text
        self.feedback_frame = tk.Frame(self.quiz_card)
        self.feedback_frame.pack(fill="x", pady=(14, 0))

        self.feedback_shape = tk.Label(
            self.feedback_frame,
            font=("Helvetica", 26, "bold"),
            width=3,
        )
        self.feedback_shape.pack(side="left")

        self.feedback_text = tk.Label(
            self.feedback_frame,
            font=("Helvetica", 13),
            anchor="w",
        )
        self.feedback_text.pack(side="left", padx=6)

        # Score
        self.score_label = tk.Label(
            self.quiz_card,
            font=("Helvetica", 11),
        )
        self.score_label.pack(anchor="e", pady=(10, 0))

        # Next question button
        self.next_q_btn = tk.Button(
            self.quiz_card,
            text="Next Question →",
            font=("Helvetica", 12, "bold"),
            relief="flat",
            padx=18,
            pady=8,
            cursor="hand2",
            command=self._next_question,
        )
        self.next_q_btn.pack(anchor="e", pady=(6, 0))
        self.next_q_btn.pack_forget()

        self._load_question()

    def _load_question(self):
        if self.quiz_index >= len(QUIZ):
            self.q_label.config(text=f"Quiz complete!  Final score: {self.score}/{len(QUIZ)}")
            for btn in self.option_btns:
                btn.pack_forget()
            self.feedback_shape.config(text="★")
            self.feedback_text.config(text="Well done! All questions answered.")
            self.next_q_btn.pack_forget()
            return

        q = QUIZ[self.quiz_index]
        self.q_label.config(text=f"Q{self.quiz_index + 1}. {q['question']}")
        for i, opt in enumerate(q["options"]):
            self.option_btns[i].config(text=f"  {opt}", state="normal")
        self.feedback_shape.config(text="")
        self.feedback_text.config(text="")
        self.next_q_btn.pack_forget()
        self._apply_btn_colours()
        self._update_score_label()

    def _check_answer(self, idx: int):
        p = PALETTES[self.current_mode.get()]
        q = QUIZ[self.quiz_index]
        chosen = q["options"][idx]

        for btn in self.option_btns:
            btn.config(state="disabled")

        if chosen == q["answer"]:
            self.score += 1
            # Shape: Triangle ▲  +  text  +  border colour
            self.feedback_shape.config(text="▲", fg=p.correct)
            self.feedback_text.config(
                text=f"{QUIZ_CORRECT_SYMBOL}   ({QUIZ_CORRECT_SHAPE})",
                fg=p.text,
            )
            self.option_btns[idx].config(relief="groove", highlightbackground=p.correct)
        else:
            # Shape: Square ■  +  text  +  border colour
            self.feedback_shape.config(text="■", fg=p.wrong)
            self.feedback_text.config(
                text=f"{QUIZ_WRONG_SYMBOL}   ({QUIZ_WRONG_SHAPE})  |  Answer: {q['answer']}",
                fg=p.text,
            )
            self.option_btns[idx].config(relief="groove", highlightbackground=p.wrong)

        self._update_score_label()
        self.next_q_btn.pack(anchor="e", pady=(6, 0))

    def _next_question(self):
        self.quiz_index += 1
        self._load_question()

    def _update_score_label(self):
        p = PALETTES[self.current_mode.get()]
        answered = self.quiz_index if self.quiz_index < len(QUIZ) else len(QUIZ)
        self.score_label.config(
            text=f"Score: {self.score} / {answered} answered",
            fg=p.text_sub,
            bg=p.card,
        )

    # ─── Apply full palette ───────────────────────────────────

    def _apply_palette(self):
        p = PALETTES[self.current_mode.get()]

        # Root + frames
        for w in [self.root, self.main_frame, self.left, self.right,
                  self.top_bar, self.feedback_frame]:
            w.config(bg=p.bg)

        # Top bar radio buttons
        for child in self.top_bar.winfo_children():
            try:
                child.config(
                    bg=p.bg,
                    fg=p.text,
                    selectcolor=p.accent,
                    activebackground=p.bg,
                    activeforeground=p.accent,
                )
            except Exception:
                pass

        # Load card
        self.load_card.config(bg=p.card, fg=p.text)
        for w in [self.load_shape_label, self.load_num_label,
                  self.load_name_label, self.level_slider]:
            try:
                w.config(bg=p.card, fg=p.text if w != self.load_name_label else p.text_sub)
            except Exception:
                pass
        self.level_slider.config(bg=p.card, troughcolor=p.border, activebackground=p.accent)
        for child in self.load_card.winfo_children():
            try:
                child.config(bg=p.card, fg=p.text_sub)
            except Exception:
                pass
        self._update_load_indicator()

        # Status panel
        self._update_status_colours(p)

        # Quiz card
        self.quiz_card.config(bg=p.card, fg=p.text)
        self.q_label.config(bg=p.card, fg=p.text)
        self.score_label.config(bg=p.card, fg=p.text_sub)
        self.feedback_shape.config(bg=p.card)
        self.feedback_text.config(bg=p.card, fg=p.text)
        self.feedback_frame.config(bg=p.card)
        self.next_q_btn.config(
            bg=p.accent,
            fg=p.card,
            activebackground=p.accent2,
            activeforeground=p.card,
        )
        self._apply_btn_colours()

    def _apply_btn_colours(self):
        p = PALETTES[self.current_mode.get()]
        for btn in self.option_btns:
            btn.config(
                bg=p.bg,
                fg=p.text,
                activebackground=p.accent2,
                activeforeground=p.text,
                highlightbackground=p.border,
            )


# ─────────────────────────────────────────
#  Launch
# ─────────────────────────────────────────

if __name__ == "__main__":
    root = tk.Tk()
    app = ColourBlindApp(root)
    root.mainloop()
