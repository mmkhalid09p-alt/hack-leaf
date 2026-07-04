"""
Stay Focused Mode — NeuroDev Therapy
Available at load levels 4–6.
Designed for ADHD + anxiety users.
"""

import tkinter as tk
from tkinter import font as tkfont

# --- Sample content chunks (replace with real content) ---
CONTENT_CHUNKS = [
    "Welcome. Take a breath. You are safe here.",
    "Read this slowly. There is no rush.",
    "Focus on just these words. Nothing else matters right now.",
    "You are doing great. One step at a time.",
    "Almost there. Keep going — you've got this.",
]

LOAD_LEVEL = 5  # Must be 4–6 to activate Stay Focused Mode


class StayFocusedMode:
    def __init__(self, root: tk.Tk, chunks: list, load_level: int = 5):
        self.root = root
        self.chunks = chunks
        self.load_level = load_level
        self.current_index = 0
        self.pulse_growing = True
        self.pulse_size = 0

        self._setup_window()
        self._build_ui()
        self._show_chunk()
        self._pulse()

    def _setup_window(self):
        self.root.title("Stay Focused Mode")
        self.root.configure(bg="#F0F4FF")  # Soft blue background
        self.root.attributes("-fullscreen", True)
        self.root.bind("<Escape>", lambda e: self.root.destroy())

    def _build_ui(self):
        # Load level label (top-right corner)
        self.level_label = tk.Label(
            self.root,
            text=f"Load Level: {self.load_level}",
            bg="#F0F4FF",
            fg="#9BAABF",
            font=("Helvetica", 11),
        )
        self.level_label.place(relx=0.97, rely=0.03, anchor="ne")

        # Canvas for pulsing focus ring
        self.canvas = tk.Canvas(
            self.root,
            bg="#F0F4FF",
            highlightthickness=0,
        )
        self.canvas.place(relx=0.5, rely=0.42, anchor="center", width=740, height=300)
        self.ring = self.canvas.create_oval(10, 10, 730, 290, outline="#6B8CFF", width=4)

        # Content text label (inside canvas, overlaid)
        self.text_var = tk.StringVar()
        self.text_label = tk.Label(
            self.root,
            textvariable=self.text_var,
            bg="#FFFFFF",
            fg="#2C3E6B",
            font=tkfont.Font(family="Helvetica", size=22, weight="normal"),
            wraplength=640,
            justify="center",
            padx=40,
            pady=40,
            relief="flat",
            bd=0,
        )
        self.text_label.place(relx=0.5, rely=0.42, anchor="center", width=700, height=260)

        # Progress dots
        self.dot_frame = tk.Frame(self.root, bg="#F0F4FF")
        self.dot_frame.place(relx=0.5, rely=0.72, anchor="center")
        self.dots = []
        for i in range(len(self.chunks)):
            dot = tk.Label(self.dot_frame, text="●", bg="#F0F4FF", font=("Helvetica", 14))
            dot.pack(side="left", padx=4)
            self.dots.append(dot)

        # Next button
        self.next_btn = tk.Button(
            self.root,
            text="Next →",
            command=self._next_chunk,
            bg="#6B8CFF",
            fg="white",
            font=tkfont.Font(family="Helvetica", size=16, weight="bold"),
            relief="flat",
            padx=36,
            pady=14,
            cursor="hand2",
            activebackground="#4F72E3",
            activeforeground="white",
            bd=0,
        )
        self.next_btn.place(relx=0.5, rely=0.82, anchor="center")

        # Finish label (hidden until the last chunk)
        self.finish_label = tk.Label(
            self.root,
            text="Session Complete. Well done.",
            bg="#F0F4FF",
            fg="#4CAF50",
            font=("Helvetica", 16),
        )

        # Exit hint
        tk.Label(
            self.root,
            text="Press ESC to exit",
            bg="#F0F4FF",
            fg="#C5CEDF",
            font=("Helvetica", 10),
        ).place(relx=0.5, rely=0.96, anchor="center")

    def _show_chunk(self):
        self.text_var.set(self.chunks[self.current_index])
        for i, dot in enumerate(self.dots):
            if i < self.current_index:
                dot.config(fg="#6B8CFF")   # visited
            elif i == self.current_index:
                dot.config(fg="#2C3E6B")   # active
            else:
                dot.config(fg="#D0D8EB")   # upcoming

        if self.current_index >= len(self.chunks) - 1:
            self.next_btn.place_forget()
            self.finish_label.place(relx=0.5, rely=0.82, anchor="center")

    def _next_chunk(self):
        if self.current_index < len(self.chunks) - 1:
            self.current_index += 1
            self._show_chunk()

    def _pulse(self):
        """Animate the focus ring: gently pulses in/out."""
        coords = self.canvas.coords(self.ring)
        if not coords:
            return
        x1, y1, x2, y2 = coords
        step = 1.5
        if self.pulse_growing:
            x1 -= step; y1 -= step; x2 += step; y2 += step
            self.pulse_size += 1
            if self.pulse_size >= 8:
                self.pulse_growing = False
        else:
            x1 += step; y1 += step; x2 -= step; y2 -= step
            self.pulse_size -= 1
            if self.pulse_size <= 0:
                self.pulse_growing = True

        self.canvas.coords(self.ring, x1, y1, x2, y2)
        self.root.after(40, self._pulse)


def launch(load_level: int = LOAD_LEVEL, chunks: list = CONTENT_CHUNKS):
    if load_level < 4 or load_level > 6:
        print(f"Stay Focused Mode only activates at load levels 4-6. Current level: {load_level}")
        return

    root = tk.Tk()
    StayFocusedMode(root, chunks=chunks, load_level=load_level)
    root.mainloop()


if __name__ == "__main__":
    launch(load_level=LOAD_LEVEL, chunks=CONTENT_CHUNKS)
