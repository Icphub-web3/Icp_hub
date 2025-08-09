import os
import glob
import re
from datetime import datetime

def find_latest_log():
    files = glob.glob("QA_Log_*.md")
    if not files:
        return None
    files.sort(reverse=True)
    return files[0]

def parse_log(file_path):
    sections = {
        "✅ Tasks Done": [],
        "🐛 Bugs Found": [],
        "🛠 Fixes Verified": [],
        "📈 Observations": [],
        "🔁 Next Steps": []
    }

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    for section in sections.keys():
        pattern = rf"### {re.escape(section)}\n(.*?)(?=\n###|\Z)"
        match = re.search(pattern, content, re.DOTALL)
        if match:
            lines = [line.strip("- ").strip() for line in match.group(1).strip().split("\n") if line.strip()]
            sections[section] = lines if lines else [f"No data provided for {section}"]
        else:
            sections[section] = [f"No data provided for {section}"]

    return sections

def extract_date_from_filename(filename):
    match = re.search(r"QA_Log_(\d{4}-\d{2}-\d{2})\.md", filename)
    if match:
        return match.group(1)
    else:
        return datetime.today().strftime('%Y-%m-%d')

def generate_report(sections, date):
    key_takeaways = sections["✅ Tasks Done"] + sections["🛠 Fixes Verified"] + sections["📈 Observations"]
    progress_summary = sections["🛠 Fixes Verified"] + sections["📈 Observations"]
    next_steps = sections["🔁 Next Steps"]
    bugs = sections["🐛 Bugs Found"]

    def list_block(items):
        return "\n".join(f"- {item}" for item in items)

    return f"""### 📣 Project Update: {date}

#### 🔑 Key Takeaways
{list_block(key_takeaways)}

#### 🐛 Bugs Found
{list_block(bugs)}

#### 📊 Progress Summary
{list_block(progress_summary)}

#### 🔁 Next Steps
{list_block(next_steps)}
"""

def main():
    log_file = find_latest_log()
    if not log_file:
        print("❌ No QA_Log_*.md file found in this directory.")
        return

    sections = parse_log(log_file)
    date = extract_date_from_filename(log_file)
    report = generate_report(sections, date)

    print(report)

if __name__ == "__main__":
    main()

