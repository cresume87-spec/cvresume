#!/usr/bin/env python3
import os
import subprocess
from datetime import datetime

HANDOVER_FILE = ".agent/HANDOVER.md"
PROJECT_FILE = "PROJECT.md"

def run_command(command):
    try:
        result = subprocess.run(command, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError:
        return "No tracking available or Git not initialized."

def get_current_task():
    if not os.path.exists(PROJECT_FILE):
        return "Unknown task (PROJECT.md not found)."
    
    with open(PROJECT_FILE, "r") as f:
        lines = f.readlines()
        
    task_section = False
    task_desc = []
    for line in lines:
        if "🚧 Current Active Task" in line:
            task_section = True
            continue
        if task_section:
            if line.strip() == "" or line.startswith("#"):
                if len(task_desc) > 0:
                    break
            task_desc.append(line.strip())
            
    return "\n".join(task_desc) if task_desc else "No active task found in PROJECT.md."

def get_modified_files():
    files = run_command("git diff --name-only")
    if not files:
        files = run_command("git status --short")
    return files if files else "No uncommitted changes."

def generate_handover():
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    current_task = get_current_task()
    modified_files = get_modified_files()
    
    # Трюк для обхода парсеров Markdown: прячем бэктики в переменную
    ticks = "```"
    
    markdown_content = f"""# 🧩 CONTEXT HANDOVER

**Generated:** {timestamp}

## 🎯 Current Context / Task
{current_task}

## 📂 Recently Modified Files
{ticks}text
{modified_files}
{ticks}

## 🏗️ Architectural Changes (AI MUST FILL THIS)
- [Gemini: Describe any DB schema changes, new API routes, or env vars added here]

## 🚀 Next Action for Incoming Agent
- [Gemini: Write exact instructions for the next agent (e.g., 'Backend is done, please build the UI in src/app/login/page.tsx')]
"""

    os.makedirs(os.path.dirname(HANDOVER_FILE), exist_ok=True)
    with open(HANDOVER_FILE, "w") as f:
        f.write(markdown_content)
        
    print(f"✅ [SUCCESS] Handover snapshot generated at {HANDOVER_FILE}")
    print("🤖 AI ACTION REQUIRED:")
    print(f"1. Open {HANDOVER_FILE}.")
    print("2. Manually fill in the 'Architectural Changes' and 'Next Action' bullet points.")
    print("3. Tell the user: 'Handover file is ready. You can copy its contents to the next chat.'")

if __name__ == "__main__":
    generate_handover()