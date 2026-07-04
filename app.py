import streamlit as st

st.set_page_config(page_title="NeuroLearn", layout="wide")

# Session state initialization
if "sensory_level" not in st.session_state:
    st.session_state.sensory_level = 3.0
if "user_profile" not in st.session_state:
    st.session_state.user_profile = {}

# Get current page from query parameters
if "page" in st.query_params:
    default_page = st.query_params["page"]
    if default_page not in ["Onboarding", "Learn", "Calm", "Profile"]:
        default_page = "Onboarding"
else:
    default_page = "Onboarding"

# Sidebar navigation
page = st.sidebar.radio(
    "Navigate", 
    ["Onboarding", "Learn", "Calm", "Profile"], 
    index=["Onboarding", "Learn", "Calm", "Profile"].index(default_page)
)
st.query_params["page"] = page

# Header
st.title("🧠 NeuroLearn")

# Map level to emoji & colors (only slider text will change color)
level = st.session_state.sensory_level
if level <= 5.0:
    emoji, theme_label, text_color = "😊", "Clear/Calm", "#7c3aed"
elif level <= 9.0:
    emoji, theme_label, text_color = "😰", "Heavy/Overwhelmed", "#92400e"
else:
    emoji, theme_label, text_color = "🌊", "Crisis Mode", "#b91c1c"

# Permanent gradual slider without numeric labels
st.session_state.sensory_level = st.slider(
    f"How's your brain feeling right now? {emoji} — {theme_label}", 
    1.0, 10.0, st.session_state.sensory_level, step=0.5,
    label_visibility="visible"
)

# Custom Low/High labels below the slider
st.markdown(
    f"<div style='display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; color: {text_color}; margin-top: -15px; margin-bottom: 15px; transition: color 0.8s ease;'><span>Low</span><span>High</span></div>", 
    unsafe_allow_html=True
)

# CSS to hide the default Streamlit slider min/max numbers, and color ONLY the slider text
st.markdown(f"""
<style>
    /* Color ONLY the slider label and its text components */
    .stSlider label, .stSlider p, .stSlider span {{
        color: {text_color} !important;
        transition: color 0.8s ease-in-out !important;
    }}
    /* Hide the default min/max numeric values below the slider */
    div[data-testid="stSliderTickBarMin"], div[data-testid="stSliderTickBarMax"] {{
        display: none !important;
    }}
    div[data-testid="stWidgetInstructions"] {{
        display: none !important;
    }}
</style>
""", unsafe_allow_html=True)

# Page Rendering
if level >= 9.5:
    st.header("🌊 Calm Mode Takeover")
    st.write("Everything is paused. Focus on your breathing:")
    st.info("🧘 Breathe in... (4s) -> Hold... (4s) -> Breathe out... (4s)")
else:
    if page == "Onboarding":
        st.header("👋 Onboarding")
        st.write("Quick profile setup (30 seconds, no account)")
        name = st.text_input("What is your name?")
        if st.button("Save Profile"):
            st.session_state.user_profile["name"] = name
            st.success(f"Welcome, {name}!")

    elif page == "Learn":
        st.header("📖 Learn")
        topic = st.text_input("Enter topic to learn:")
        if topic:
            st.write(f"### Learning: {topic}")
            if level <= 5.0:
                st.write(f"**Detailed Academic Concept:** {topic} is a complex subject studied in depth. It requires extensive cognitive focus and features multi-layered structured contexts and relational logic.")
            else:
                st.write(f"**Dead Simple Summary:** {topic} is simply a method to organize and process information.")

    elif page == "Calm":
        st.header("🌊 Calm")
        st.write("Take a deep breath and relax. Let the mind rest.")

    elif page == "Profile":
        st.header("⚙️ Profile & Accessibility")
        st.checkbox("Deaf / Hard of Hearing Mode")
        st.checkbox("Color Blind Friendly Mode")
