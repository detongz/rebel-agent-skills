# Skills Dependency Graph

## Overview

The Skills Dependency Graph is a visualization tool that shows how AI Agent Skills depend on each other within the MySkills Protocol ecosystem. It automatically extracts dependency information from `package.json` files during skill scanning and visualizes the skill-to-skill relationships.

## Location

- **URL**: `https://myskills2026.ddttupupo.buzz/skills-map`
- **Navigation**: Access via "SKILL MAP" link in the main navigation

## Features

### Graph View

Interactive canvas-based visualization:

- **Nodes**: Represent skills, colored by platform:
  - Orange: Coze
  - Green: Claude Code
  - Blue: Manus
  - Purple: MiniMax
  - Default: MySkills (for published skills)

- **Node Size**: Larger nodes = more references from other skills

- **Edges**: Show dependency relationships between skills:
  - Arrow direction: From dependent skill to dependency
  - Highlighted when a skill is selected

- **Interactions**:
  - Drag to pan the graph
  - Scroll to zoom in/out
  - Click a node to see details (referenced by / uses)
  - Hover for visual feedback

### List View

Sortable list of all skills:
- Sort by: References (default), Name, or Category
- Shows reference count for each skill
- Rank badges for top 3 skills (Gold, Silver, Bronze)
- Click to view skill details

### Statistics Dashboard

Top metrics displayed:
- Total Skills (nodes in the graph)
- Total Relationships (dependency links)
- Connected Skills (skills with at least one dependency)
- Average Connections per Skill
- Most Referenced Skill

## How It Works

### Dependency Extraction

When a skill repository is scanned via the `/api/scan` endpoint:

1. **Clone Repository**: The repository is cloned to a temporary directory
2. **Parse package.json**: Dependencies are extracted from `package.json`
3. **Identify Skill Dependencies**: Known skill packages are identified using patterns:
   - `@modelcontextprotocol/*` packages
   - `langchain`, `@langchain/*`
   - `openai`, `@anthropic-ai/sdk`
   - Packages matching patterns: `agent-*`, `skill-*`, `claude-*`, `openai-*`

4. **Store Dependencies**: When the skill is published, dependencies are stored in the database

### Known Skill Packages

The following package patterns are recognized as skill dependencies:

```typescript
const KNOWN_SKILL_PACKAGES = [
  // MCP Server packages
  '@modelcontextprotocol/server',
  '@modelcontextprotocol/inspector',

  // Agent framework packages
  'langchain',
  '@langchain/core',
  'openai',
  '@anthropic-ai/sdk',

  // Agent skill patterns (heuristic)
  /^agent-/,
  /^skill-/,
  /^claude-/,
  /^openai-/,
];
```

## Technical Details

### API Endpoints

#### `GET /api/skills/graph`

Returns the dependency graph data for visualization.

**Response**:
```json
{
  "success": true,
  "data": {
    "nodes": [
      {
        "id": "0x123...",
        "name": "Crypto Market Analyst",
        "category": "finance"
      }
    ],
    "links": [
      {
        "source": "0x456...",
        "target": "0x123...",
        "type": "depends-on"
      }
    ]
  },
  "stats": {
    "totalNodes": 25,
    "totalLinks": 42,
    "avgConnections": "1.68"
  }
}
```

#### `POST /api/scan`

Scans a repository and extracts dependencies.

**Request**:
```json
{
  "url": "https://github.com/user/repo",
  "full": false
}
```

**Response includes**:
```json
{
  "dependencies": [
    {
      "name": "@modelcontextprotocol/server",
      "version": "^1.0.0",
      "type": "runtime",
      "isSkill": true
    }
  ]
}
```

### Files

- `frontend/lib/skills-db.ts` - Database layer with dependency storage
- `frontend/lib/skill-relationships.ts` - Graph building utilities
- `frontend/app/api/skills/graph/route.ts` - Graph API endpoint
- `frontend/app/api/scan/route.ts` - Scan with dependency extraction
- `frontend/app/skills-map/page.tsx` - Visualization page component

### Database Schema

Dependencies are stored in the `dependencyGraph` array:

```typescript
interface SkillDependency {
  sourceSkillId: string;  // The skill that has this dependency
  targetSkillName: string; // The name of the skill being depended on
  packageName: string;    // The npm package name
  version: string;
  type: 'runtime' | 'development' | 'peer';
  discoveredAt: string;
}
```

## Usage Example

### Publishing a Skill with Dependencies

```bash
# Scan a repository (dependencies are extracted)
npx myskills scan https://github.com/user/my-skill

# Publish the skill (dependencies are stored)
npx myskills publish https://github.com/user/my-skill \
  --name "My AI Skill" \
  --category "productivity"
```

### View the Dependency Graph

```bash
# Open the skills map in your browser
open https://myskills2026.ddttupupo.buzz/skills-map
```

## Future Enhancements

Potential improvements:
1. **Dependency Version Tracking**: Show which versions are being used
2. **Circular Dependency Detection**: Warn about circular dependencies
3. **Dependency Updates**: Notify when dependencies have new versions
4. **Security Scoring**: Factor in dependency security scores
5. **Alternative Suggestions**: Suggest alternative dependencies
6. **Export Graph**: Export as PNG/SVG/Image
7. **Graph Layout Options**: Different layout algorithms
8. **Dependency Health Score**: Overall dependency health metric
9. **Real-time Updates**: WebSocket for live graph updates
10. **Filter by Type**: Filter by dependency type (runtime/dev/peer)

## Marketing Points

### For Developers

- "See how skills connect before you use them"
- "Understand your skill's dependencies at a glance"
- "Discover popular infrastructure skills"

### For Researchers

- "Explore the AI Agent skill ecosystem"
- "Identify key infrastructure dependencies"
- "Analyze skill adoption patterns"

### For Project Teams

- "Plan your skill architecture with dependency insights"
- "Avoid vendor lock-in by seeing alternatives"
- "Make informed dependency choices"
