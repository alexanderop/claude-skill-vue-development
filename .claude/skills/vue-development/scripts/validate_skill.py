#!/usr/bin/env python3
"""
Quick validation script for vue-development skill
"""

import sys
import re
from pathlib import Path

def validate_skill(skill_path):
    """Basic validation of the vue-development skill"""
    skill_path = Path(skill_path)

    # Check SKILL.md exists
    skill_md = skill_path / 'SKILL.md'
    if not skill_md.exists():
        return False, "SKILL.md not found"

    # Read and validate frontmatter
    content = skill_md.read_text()
    if not content.startswith('---'):
        return False, "No YAML frontmatter found"

    # Extract frontmatter
    match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not match:
        return False, "Invalid frontmatter format"

    frontmatter = match.group(1)

    # Check required fields
    if 'name:' not in frontmatter:
        return False, "Missing 'name' in frontmatter"
    if 'description:' not in frontmatter:
        return False, "Missing 'description' in frontmatter"

    # Extract name for validation
    name_match = re.search(r'name:\s*(.+)', frontmatter)
    if name_match:
        name = name_match.group(1).strip()
        # Check naming convention (hyphen-case: lowercase with hyphens)
        if not re.match(r'^[a-z0-9-]+$', name):
            return False, f"Name '{name}' should be hyphen-case (lowercase letters, digits, and hyphens only)"
        if name.startswith('-') or name.endswith('-') or '--' in name:
            return False, f"Name '{name}' cannot start/end with hyphen or contain consecutive hyphens"

    # Extract and validate description
    desc_match = re.search(r'description:\s*(.+)', frontmatter)
    if desc_match:
        description = desc_match.group(1).strip()
        # Check for angle brackets
        if '<' in description or '>' in description:
            return False, "Description cannot contain angle brackets (< or >)"

    # Check expected directories exist
    expected_dirs = ['templates', 'references']
    for dir_name in expected_dirs:
        dir_path = skill_path / dir_name
        if not dir_path.exists():
            return False, f"Expected directory '{dir_name}' not found"

    # Check templates exist
    template_files = ['component.template.vue', 'composable.template.ts', 'store.template.ts', 'test.template.ts']
    templates_dir = skill_path / 'templates'
    for template in template_files:
        template_path = templates_dir / template
        if not template_path.exists():
            return False, f"Expected template '{template}' not found in templates/"

    # Check reference files exist
    reference_files = ['COMPONENT-PATTERNS.md', 'COMPOSITION-EXCELLENCE.md', 'PATTERNS.md',
                      'STATE-MANAGEMENT.md', 'TESTING.md', 'TYPESCRIPT.md']
    references_dir = skill_path / 'references'
    for ref in reference_files:
        ref_path = references_dir / ref
        if not ref_path.exists():
            return False, f"Expected reference '{ref}' not found in references/"

    return True, "Vue development skill is valid!"

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python validate_skill.py <skill_directory>")
        sys.exit(1)

    valid, message = validate_skill(sys.argv[1])
    print(message)
    sys.exit(0 if valid else 1)
