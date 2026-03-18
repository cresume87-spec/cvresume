#!/usr/bin/env python3
import os
import sys
import argparse
from datetime import datetime

def create_directories(file_path):
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

def update_project_md(feature_name, category):
    project_md_path = "PROJECT.md"
    if not os.path.exists(project_md_path):
        print("⚠️ [WARNING] PROJECT.md not found. Skipping documentation update.")
        return

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    entry = f"- [ ] Implement {feature_name} ({category}) - Scaffolding created on {timestamp}\n"
    
    with open(project_md_path, "a") as f:
        f.write(entry)
    print(f"✅ [DOCS] Appended task to PROJECT.md")

def generate_templates(name, category):
    base_src = f"src/components/{category}"
    base_test = f"__tests__/{category}"
    
    component_path = f"{base_src}/{name}.tsx"
    test_path = f"{base_test}/{name}.test.tsx"

    component_code = f"""import React from 'react';
import {{ cn }} from '@/lib/utils';

export interface {name}Props extends React.HTMLAttributes<HTMLDivElement> {{
  // TODO: Define strict props here. No 'any'.
}}

/**
 * {name} Component ({category})
 * @description Automatically generated scaffold. Architect (Claude) must define logic.
 */
export const {name} = ({{ className, ...props }}: {name}Props) => {{
  return (
    <div className={{cn("base-classes-here", className)}} {{...props}}>
      {name} works!
    </div>
  );
}};
"""

    test_code = f"""import {{ render, screen }} from '@testing-library/react';
import {{ {name} }} from '@/components/{category}/{name}';
import '@testing-library/jest-dom';

describe('{name} Component', () => {{
  it('renders correctly', () => {{
    render(<{name} />);
    const element = screen.getByText('{name} works!');
    expect(element).toBeInTheDocument();
  }});

  it('fails intentionally - Architect MUST write real tests here', () => {{
    // TODO: Write actual business logic tests
    expect(true).toBe(false); 
  }});
}});
"""

    create_directories(component_path)
    with open(component_path, "w") as f:
        f.write(component_code)
    print(f"✅ [CODE] Created component at: {component_path}")

    create_directories(test_path)
    with open(test_path, "w") as f:
        f.write(test_code)
    print(f"✅ [TEST] Created test at: {test_path}")

def main():
    parser = argparse.ArgumentParser(description="AI Agent Feature Scaffolding Tool")
    parser.add_argument("name", help="Name of the component (e.g., Button, UserProfile)")
    parser.add_argument("category", choices=["ui", "features"], help="Category of the component")
    
    args = parser.parse_args()
    
    print(f"🚀 Initializing Feature: {args.name} in category '{args.category}'...")
    generate_templates(args.name, args.category)
    update_project_md(args.name, args.category)
    
    print("\n========================================")
    print("🤖 AI ACTION REQUIRED:")
    print("1. ARCHITECT (Claude): Update the interface and write failing tests in the .test.tsx file.")
    print("2. IMPLEMENTER (Gemini): Write the component logic to make Claude's tests pass.")
    print("3. Execute: bash .agent/skills/project-health/scripts/verify.sh")
    print("========================================")

if __name__ == "__main__":
    main()