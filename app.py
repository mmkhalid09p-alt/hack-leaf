import streamlit as st

st.set_page_config(page_title="NeuroLearn", layout="wide")


# Session state initialization
if "sensory_level" not in st.session_state:
    st.session_state.sensory_level = 3
if "user_profile" not in st.session_state:
    st.session_state.user_profile = {}

# Get current page from query parameters (URL)
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

# Update URL query parameters
st.query_params["page"] = page


# Header with Sensory Load Meter
st.title("🧠 NeuroLearn")
st.session_state.sensory_level = st.slider("How's your brain feeling right now? (1-10)", 1, 10, st.session_state.sensory_level)

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
        if st.session_state.sensory_level >= 7:
            st.write(f"**Focus:** Learning {topic}. Let's take it easy.")
        else:
            st.write(f"### Dynamic content for: {topic}")

elif page == "Calm":
    st.header("🌊 Calm Mode")
    st.write("Breathe in... Breathe out...")
    
elif page == "Profile":
    st.header("⚙️ Profile & Accessibility")
    st.checkbox("Deaf / Hard of Hearing Mode")
    st.checkbox("Color Blind Friendly Mode")
