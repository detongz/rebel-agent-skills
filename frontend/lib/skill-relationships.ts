/**
 * Skill Relationship System
 * Analyzes and manages skill-to-skill relationships and dependencies
 */

export interface SkillRelationship {
  sourceId: number;      // The skill that references another
  targetId: number;      // The skill being referenced
  type: 'depends-on' | 'uses' | 'complements' | 'similar-to';
  strength?: number;     // 0-1, how strong the relationship is
}

export interface SkillNode {
  id: number;
  name: string;
  category: string;
  platform: string;
  references: number;    // How many other skills reference this skill
  referencedBy: number[]; // IDs of skills that reference this skill
  referencesTo: number[]; // IDs of skills this skill references
}

// Hardcoded skill relationships based on skill functionality
// In production, this would come from the database or smart contract
export const SKILL_RELATIONSHIPS: SkillRelationship[] = [
  // Web Scraper Pro is widely referenced
  { sourceId: 6, targetId: 22, type: 'depends-on', strength: 0.9 },  // Crypto Market Analyst → Web Scraper Pro
  { sourceId: 7, targetId: 22, type: 'depends-on', strength: 0.85 }, // On-Chain Data Explorer → Web Scraper Pro
  { sourceId: 16, targetId: 22, type: 'uses', strength: 0.8 },       // Workflow Automation → Web Scraper Pro
  { sourceId: 14, targetId: 22, type: 'depends-on', strength: 0.75 }, // Sentiment Analysis → Web Scraper Pro

  // Sentiment Analysis is referenced by several skills
  { sourceId: 6, targetId: 14, type: 'uses', strength: 0.9 },        // Crypto Market Analyst → Sentiment Analysis
  { sourceId: 20, targetId: 14, type: 'uses', strength: 0.85 },      // Customer Support Bot → Sentiment Analysis

  // Document Scanner references
  { sourceId: 4, targetId: 13, type: 'uses', strength: 0.8 },        // PDF Data Extractor → Document Scanner
  { sourceId: 5, targetId: 13, type: 'uses', strength: 0.75 },       // Document Intelligence → Document Scanner

  // Smart Contract Generator relationships
  { sourceId: 1, targetId: 9, type: 'complements', strength: 0.7 },  // Smart Contract Auditor → Contract Generator
  { sourceId: 10, targetId: 9, type: 'uses', strength: 0.85 },       // Test Suite Builder → Contract Generator

  // Test Suite Builder relationships
  { sourceId: 1, targetId: 10, type: 'complements', strength: 0.8 }, // Smart Contract Auditor → Test Suite Builder
  { sourceId: 9, targetId: 10, type: 'uses', strength: 0.9 },       // Contract Generator → Test Suite Builder

  // PDF processing relationships
  { sourceId: 5, targetId: 4, type: 'similar-to', strength: 0.6 },   // Document Intelligence → PDF Extractor

  // Image processing relationships
  { sourceId: 25, targetId: 13, type: 'similar-to', strength: 0.5 }, // Image Content Analyzer → Document Scanner
  { sourceId: 12, targetId: 25, type: 'uses', strength: 0.7 },       // NFT Art Generator → Image Content Analyzer

  // Translation relationships
  { sourceId: 24, targetId: 15, type: 'uses', strength: 0.6 },       // Document Summarizer → Translation Agent
  { sourceId: 20, targetId: 15, type: 'uses', strength: 0.5 },       // Customer Support Bot → Translation Agent

  // Code quality relationships
  { sourceId: 17, targetId: 9, type: 'complements', strength: 0.75 }, // Code Quality Auditor → Contract Generator
  { sourceId: 17, targetId: 10, type: 'complements', strength: 0.7 }, // Code Quality Auditor → Test Suite Builder

  // Media processing relationships
  { sourceId: 18, targetId: 21, type: 'uses', strength: 0.8 },       // Video Transcription → Audio Enhancement
  { sourceId: 18, targetId: 24, type: 'uses', strength: 0.65 },      // Video Transcription → Document Summarizer

  // Financial report relationships
  { sourceId: 8, targetId: 4, type: 'depends-on', strength: 0.8 },   // Financial Report Generator → PDF Extractor
  { sourceId: 8, targetId: 5, type: 'uses', strength: 0.7 },         // Financial Report Generator → Document Intelligence

  // API Integration relationships
  { sourceId: 16, targetId: 11, type: 'uses', strength: 0.9 },       // Workflow Automation → API Integration Builder
  { sourceId: 20, targetId: 11, type: 'depends-on', strength: 0.7 }, // Customer Support Bot → API Integration Builder

  // Marketing relationships
  { sourceId: 19, targetId: 14, type: 'uses', strength: 0.6 },       // Marketing Copy Generator → Sentiment Analysis

  // Security analysis relationships
  { sourceId: 2, targetId: 1, type: 'similar-to', strength: 0.7 },   // DeFi Protocol Analyzer → Smart Contract Auditor
  { sourceId: 3, targetId: 1, type: 'complements', strength: 0.8 },  // Flash Loan Simulator → Smart Contract Auditor
  { sourceId: 3, targetId: 2, type: 'uses', strength: 0.75 },        // Flash Loan Simulator → DeFi Protocol Analyzer

  // LaTeX to Math relationships
  { sourceId: 23, targetId: 13, type: 'complements', strength: 0.5 }, // LaTeX Recognizer → Document Scanner
];

/**
 * Build a graph structure from skills and relationships
 */
export function buildSkillGraph(skills: any[]): SkillNode[] {
  // Initialize nodes
  const nodes: Map<number, SkillNode> = new Map();

  for (const skill of skills) {
    nodes.set(skill.id, {
      id: skill.id,
      name: skill.name,
      category: skill.category || 'Other',
      platform: skill.platform,
      references: 0,
      referencedBy: [],
      referencesTo: [],
    });
  }

  // Process relationships
  for (const rel of SKILL_RELATIONSHIPS) {
    const source = nodes.get(rel.sourceId);
    const target = nodes.get(rel.targetId);

    if (source && target) {
      // Add to source's references
      if (!source.referencesTo.includes(rel.targetId)) {
        source.referencesTo.push(rel.targetId);
      }

      // Add to target's referenced by
      if (!target.referencedBy.includes(rel.sourceId)) {
        target.referencedBy.push(rel.sourceId);
        target.references++;
      }
    }
  }

  return Array.from(nodes.values());
}

/**
 * Get skills sorted by reference count (most referenced first)
 */
export function getSkillsByReferenceCount(skills: any[]): SkillNode[] {
  const graph = buildSkillGraph(skills);
  return graph.sort((a, b) => b.references - a.references);
}

/**
 * Get relationships for a specific skill
 */
export function getSkillRelationships(skillId: number): {
  referencesTo: SkillRelationship[];
  referencedBy: SkillRelationship[];
} {
  const referencesTo = SKILL_RELATIONSHIPS.filter(r => r.sourceId === skillId);
  const referencedBy = SKILL_RELATIONSHIPS.filter(r => r.targetId === skillId);

  return { referencesTo, referencedBy };
}

/**
 * Get connected skills (BFS traversal)
 */
export function getConnectedSkills(
  skillId: number,
  skills: any[],
  maxDepth: number = 2
): Set<number> {
  const visited = new Set<number>();
  const queue: Array<{ id: number; depth: number }> = [{ id: skillId, depth: 0 }];

  visited.add(skillId);

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;

    if (depth >= maxDepth) continue;

    const relationships = SKILL_RELATIONSHIPS.filter(
      r => r.sourceId === id || r.targetId === id
    );

    for (const rel of relationships) {
      const neighborId = rel.sourceId === id ? rel.targetId : rel.sourceId;
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        queue.push({ id: neighborId, depth: depth + 1 });
      }
    }
  }

  return visited;
}

/**
 * Calculate graph statistics
 */
export function getGraphStats(skills: any[]) {
  const graph = buildSkillGraph(skills);
  const relationships = SKILL_RELATIONSHIPS;

  const totalSkills = skills.length;
  const totalRelationships = relationships.length;
  const skillsWithReferences = graph.filter(n => n.references > 0).length;
  const mostReferenced = graph.reduce((max, node) =>
    node.references > max.references ? node : max, graph[0]);

  const referencesPerSkill = totalRelationships / totalSkills;

  // Count relationships by type
  const byType = relationships.reduce((acc, rel) => {
    acc[rel.type] = (acc[rel.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalSkills,
    totalRelationships,
    skillsWithReferences,
    mostReferenced,
    referencesPerSkill,
    byType,
  };
}
