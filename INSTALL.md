# Quick Installation Guide

This is a Claude Code Agent Skill for Vue.js development. Follow these steps to install and start using it.

## Prerequisites

- Claude Code version 1.0 or later
- Basic familiarity with [Claude Code](https://docs.claude.com/en/quickstart)

## Installation Options

### Option 1: Personal Installation (Recommended for Individual Use)

Install the skill for all your projects:

```bash
# Clone this repository
git clone https://github.com/yourusername/vue-development-skill.git
cd vue-development-skill

# Copy to your personal skills directory
cp -r .claude/skills/vue-development ~/.claude/skills/vue-development
```

### Option 2: Project Installation (Recommended for Teams)

Install the skill for a specific project (shared with your team):

```bash
# From your project directory
cd /path/to/your-vue-project

# Clone or copy the skill
git clone https://github.com/yourusername/vue-development-skill.git /tmp/vue-skill
cp -r /tmp/vue-skill/.claude/skills/vue-development ./.claude/skills/vue-development
rm -rf /tmp/vue-skill

# Commit to your project
git add .claude/skills/vue-development
git commit -m "Add Vue development skill"
git push
```

Team members will get the skill automatically when they pull.

## Verify Installation

1. **Start or restart Claude Code**:
   ```bash
   claude
   ```

2. **Check available skills**:
   Ask Claude in your conversation:
   ```
   What Skills are available?
   ```

   You should see `vue-development` in the list.

3. **Test the skill**:
   Ask Claude a Vue-related question:
   ```
   Create a Vue component for a todo list
   ```

   Claude should automatically use the skill to provide guidance following best practices.

## What Gets Installed

The skill directory structure:

```
~/.claude/skills/vue-development/        # (or .claude/skills/vue-development/ for project)
├── SKILL.md                             # Main instructions Claude reads
├── PATTERNS.md                          # Architectural patterns
├── STATE-MANAGEMENT.md                  # Pinia + Elm Architecture
├── TESTING.md                           # Testing best practices
├── TYPESCRIPT.md                        # TypeScript patterns
└── templates/                           # Code templates
    ├── component.template.vue
    ├── composable.template.ts
    ├── store-elm.template.ts
    └── test.template.ts
```

## How It Works

Once installed:
- **Automatic activation**: Claude uses this skill when you work with Vue code
- **No explicit invocation needed**: Just ask Vue-related questions naturally
- **Progressive loading**: Claude reads supporting files only when needed

## Usage Examples

Try asking Claude:

```
Create a composable for fetching user data
```

```
Write tests for the LoginForm component using Testing Library
```

```
Set up a Pinia store for managing todos with complex validation
```

Claude will follow the best practices defined in this skill.

## Troubleshooting

### Skill doesn't appear in available skills

1. **Check the file exists**:
   ```bash
   # For personal installation
   ls ~/.claude/skills/vue-development/SKILL.md

   # For project installation
   ls .claude/skills/vue-development/SKILL.md
   ```

2. **Restart Claude Code**:
   ```bash
   # Exit and restart
   claude
   ```

3. **Check YAML frontmatter** in SKILL.md:
   ```bash
   head -n 5 ~/.claude/skills/vue-development/SKILL.md
   ```

   Should show:
   ```yaml
   ---
   name: vue-development
   description: Guide for writing Vue.js applications...
   ---
   ```

### Claude doesn't use the skill

- **Be specific**: Mention "Vue", "component", "composable", etc. in your request
- **Check the description**: The skill's description determines when Claude uses it
- **Try explicit requests**: "Using Vue best practices, create a component for..."

### Debug mode

Run Claude Code in debug mode to see skill loading:

```bash
claude --debug
```

This will show any errors loading the skill.

## Updating the Skill

To update an installed skill:

```bash
# Pull latest changes from the repository
cd /path/to/vue-development-skill
git pull

# Copy updated skill
cp -r .claude/skills/vue-development ~/.claude/skills/vue-development

# Restart Claude Code
```

For team installations, commit and push the updates.

## Uninstalling

To remove the skill:

```bash
# Personal installation
rm -rf ~/.claude/skills/vue-development

# Project installation
rm -rf .claude/skills/vue-development
git add .claude/skills/vue-development
git commit -m "Remove Vue skill"
```

## Next Steps

- Read the [README.md](README.md) for detailed documentation
- Browse the [templates](.claude/skills/vue-development/templates/) for code examples
- Check [SKILL.md](.claude/skills/vue-development/SKILL.md) to see what Claude reads

## Support

- **Issues**: Report problems on GitHub Issues
- **Questions**: Open a GitHub Discussion
- **Claude Code docs**: https://docs.claude.com/en/docs/claude-code
- **Agent Skills guide**: https://docs.claude.com/en/docs/claude-code/agent-skills

---

**Ready to start?** Just ask Claude to help you build a Vue component!
