# Skills Relationship Map

## Overview

The Skills Relationship Map is a visualization tool that shows how AI Agent Skills reference and depend on each other within the MySkills Protocol ecosystem.

## Location

- **URL**: `http://localhost:3000/skills-map`
- **Navigation**: Access via "SKILL MAP" link in the main navigation

## Features

### Graph View

Interactive canvas-based visualization:

- **Nodes**: Represent skills, colored by platform:
  - Orange: Coze
  - Green: Claude Code
  - Blue: Manus
  - Purple: MiniMax

- **Node Size**: Larger nodes = more references from other skills

- **Edges**: Show relationships between skills:
  - Orange: "depends-on" relationships
  - Green: "uses" relationships
  - Blue: "complements" relationships
  - Purple: "similar-to" relationships

- **Interactions**:
  - Drag to pan the graph
  - Scroll to zoom in/out
  - Click a node to see details
  - Hover for visual feedback

### List View

Sortable list of all skills:

- Sort by: References (default), Name, or Category
- Shows reference count for each skill
- Click to view skill details

### Statistics Dashboard

Top metrics displayed:
- Total Skills
- Total Relationships
- Connected Skills (skills with at least one reference)
- Average Connections per Skill
- Most Referenced Skill

## Technical Details

### Files

- `frontend/lib/skill-relationships.ts` - Relationship data and graph functions
- `frontend/app/skills-map/page.tsx` - Visualization page component

### Relationship Data

Relationships are defined in `SKILL_RELATIONSHIPS` array with:
- `sourceId`: The skill that references another
- `targetId`: The skill being referenced
- `type`: Relationship type (depends-on, uses, complements, similar-to)
- `strength`: Optional 0-1 value for relationship strength

### Most Referenced Skills (Example)

Based on current mock data:
1. **Web Scraper Pro** - Referenced by 4 skills (Crypto Market Analyst, On-Chain Data Explorer, Workflow Automation, Sentiment Analysis)
2. **Smart Contract Auditor** - Referenced by 3 skills
3. **Test Suite Builder** - Referenced by 2 skills
4. **Document Scanner** - Referenced by 2 skills

## Future Enhancements

Potential improvements:
1. Add relationship data to smart contract for on-chain storage
2. Real-time updates when new skills are registered
3. Export graph as image
4. Filter by relationship type
5. Add relationship editor for skill creators
6. Integrate with actual skill dependencies (imports, API calls)
7. Animated force-directed layout algorithm
8. Search and highlight specific skills

## Usage Example

```typescript
import {
  buildSkillGraph,
  getSkillsByReferenceCount,
  getGraphStats,
} from '@/lib/skill-relationships';

// Get all skills
const skills = await getSkills();

// Build graph with relationships
const graph = buildSkillGraph(skills);

// Get skills sorted by reference count
const topSkills = getSkillsByReferenceCount(skills);

// Get graph statistics
const stats = getGraphStats(skills);
```
