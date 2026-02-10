'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getSkills } from '@/lib/contract-service';
import {
  buildSkillGraph,
  getSkillsByReferenceCount,
  getConnectedSkills,
  getGraphStats,
  getSkillRelationships,
  SKILL_RELATIONSHIPS,
  type SkillNode,
} from '@/lib/skill-relationships';

interface ViewState {
  scale: number;
  offsetX: number;
  offsetY: number;
  isDragging: boolean;
  lastX: number;
  lastY: number;
}

export default function SkillsMapPage() {
  const [skills, setSkills] = useState<any[]>([]);
  const [graph, setGraph] = useState<SkillNode[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null);
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');
  const [sortBy, setSortBy] = useState<'references' | 'name' | 'category'>('references');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [hoveredSkill, setHoveredSkill] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewState, setViewState] = useState<ViewState>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
    lastX: 0,
    lastY: 0,
  });

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const skillsData = await getSkills({ limit: 50 });
      setSkills(skillsData);
      const graphData = buildSkillGraph(skillsData);
      setGraph(graphData);
      setStats(getGraphStats(skillsData));
    } catch (error) {
      console.error('Failed to load skills:', error);
    } finally {
      setLoading(false);
    }
  };

  // Canvas drawing for graph view
  useEffect(() => {
    if (viewMode === 'graph' && canvasRef.current && graph.length > 0) {
      drawGraph();
    }
  }, [viewMode, graph, viewState, hoveredSkill, selectedSkill]);

  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.parentElement?.clientWidth || 1200;
    canvas.height = 600;

    const { scale, offsetX, offsetY } = viewState;

    // Clear canvas with cyber-industrial background
    ctx.fillStyle = 'var(--bg-void)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    const gridSize = 50 * scale;
    for (let x = offsetX % gridSize; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = offsetY % gridSize; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Calculate node positions using force-directed layout
    const positions = calculateNodePositions(canvas.width, canvas.height);

    // Draw relationships (edges)
    for (const rel of SKILL_RELATIONSHIPS) {
      const source = positions.get(rel.sourceId);
      const target = positions.get(rel.targetId);
      if (!source || !target) continue;

      const x1 = source.x * scale + offsetX;
      const y1 = source.y * scale + offsetY;
      const x2 = target.x * scale + offsetX;
      const y2 = target.y * scale + offsetY;

      // Skip if either node is way off screen
      if (x1 < -100 || x1 > canvas.width + 100 || x2 < -100 || x2 > canvas.width + 100) continue;

      const isHighlighted =
        selectedSkill && (rel.sourceId === selectedSkill.id || rel.targetId === selectedSkill.id);
      const isDimmed = selectedSkill && !isHighlighted;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);

      if (isDimmed) {
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.1)';
      } else if (isHighlighted) {
        ctx.strokeStyle = getRelationshipColor(rel.type);
      } else {
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.2)';
      }
      ctx.lineWidth = isHighlighted ? 2 : 1;
      ctx.stroke();

      // Draw arrow for direction
      if (isHighlighted || !selectedSkill) {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const arrowSize = 8;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - arrowSize * Math.cos(angle - Math.PI / 6), y2 - arrowSize * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - arrowSize * Math.cos(angle + Math.PI / 6), y2 - arrowSize * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      }
    }

    // Draw nodes
    for (const node of graph) {
      const pos = positions.get(node.id);
      if (!pos) continue;

      const x = pos.x * scale + offsetX;
      const y = pos.y * scale + offsetY;

      // Skip if way off screen
      if (x < -100 || x > canvas.width + 100) continue;

      const isSelected = selectedSkill?.id === node.id;
      const isHovered = hoveredSkill === node.id;
      const isConnected = selectedSkill && selectedSkill.referencedBy.includes(node.id);
      const isRelated = selectedSkill && selectedSkill.referencesTo.includes(node.id);
      const isDimmed = selectedSkill && !isSelected && !isConnected && !isRelated;

      const nodeSize = getNodeSize(node);
      const scaledSize = nodeSize * scale;

      // Draw node glow
      if ((isSelected || isHovered) && !isDimmed) {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, scaledSize * 2);
        gradient.addColorStop(0, getPlatformColor(node.platform, 0.3));
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, scaledSize * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw node circle
      ctx.beginPath();
      ctx.arc(x, y, scaledSize, 0, Math.PI * 2);

      if (isDimmed) {
        ctx.fillStyle = '#1a1a1a';
        ctx.strokeStyle = '#333';
      } else if (isSelected) {
        ctx.fillStyle = getPlatformColor(node.platform, 0.3);
        ctx.strokeStyle = 'var(--neon-green)';
      } else if (isConnected) {
        ctx.fillStyle = getPlatformColor(node.platform, 0.2);
        ctx.strokeStyle = 'var(--warning-orange)';
      } else if (isRelated) {
        ctx.fillStyle = getPlatformColor(node.platform, 0.2);
        ctx.strokeStyle = 'var(--neon-blue)';
      } else {
        ctx.fillStyle = getPlatformColor(node.platform, 0.15);
        ctx.strokeStyle = getPlatformColor(node.platform, 0.5);
      }

      ctx.fill();
      ctx.lineWidth = isSelected || isHovered ? 3 : 1.5;
      ctx.stroke();

      // Draw reference count badge
      if (node.references > 0 && scale > 0.5) {
        ctx.fillStyle = isSelected || isHovered ? 'var(--neon-green)' : '#666';
        ctx.font = `${Math.max(10, 12 * scale)}px 'JetBrains Mono', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.references.toString(), x, y);
      }

      // Draw skill name
      if (scale > 0.6) {
        ctx.fillStyle = isDimmed ? '#444' : 'var(--text-primary)';
        ctx.font = `${Math.max(10, 11 * scale)}px 'Rajdhani', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        // Truncate name if too long
        const displayName = node.name.length > 15 ? node.name.substring(0, 13) + '...' : node.name;
        ctx.fillText(displayName, x, y + scaledSize + 5);
      }
    }
  };

  // Simple force-directed layout
  const nodePositions = useRef<Map<number, { x: number; y: number }>>(new Map());

  const calculateNodePositions = (width: number, height: number) => {
    if (nodePositions.current.size === 0) {
      // Initialize positions
      const centerX = width / 2;
      const centerY = height / 2;

      // Sort by reference count to place important nodes in center
      const sortedNodes = [...graph].sort((a, b) => b.references - a.references);

      for (let i = 0; i < sortedNodes.length; i++) {
        const node = sortedNodes[i];
        const angle = (i / sortedNodes.length) * Math.PI * 2;
        const distance = 50 + (i / sortedNodes.length) * Math.min(width, height) * 0.4;
        nodePositions.current.set(node.id, {
          x: centerX + Math.cos(angle) * distance,
          y: centerY + Math.sin(angle) * distance,
        });
      }
    }

    return nodePositions.current;
  };

  const getNodeSize = (node: SkillNode) => {
    const baseSize = 20;
    const referenceBonus = Math.sqrt(node.references) * 5;
    return baseSize + referenceBonus;
  };

  const getPlatformColor = (platform: string, alpha: number = 1): string => {
    const colors: Record<string, string> = {
      'coze': `rgba(255, 102, 0, ${alpha})`,        // Orange
      'claude-code': `rgba(0, 255, 136, ${alpha})`, // Green
      'manus': `rgba(0, 212, 255, ${alpha})`,       // Blue
      'minimax': `rgba(147, 51, 234, ${alpha})`,    // Purple
    };
    return colors[platform] || `rgba(150, 150, 150, ${alpha})`;
  };

  const getRelationshipColor = (type: string): string => {
    const colors: Record<string, string> = {
      'depends-on': 'var(--warning-orange)',
      'uses': 'var(--neon-green)',
      'complements': 'var(--neon-blue)',
      'similar-to': 'var(--neon-purple)',
    };
    return colors[type] || '#666';
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const positions = nodePositions.current;
    const { scale, offsetX, offsetY } = viewState;

    for (const node of graph) {
      const pos = positions.get(node.id);
      if (!pos) continue;

      const nodeX = pos.x * scale + offsetX;
      const nodeY = pos.y * scale + offsetY;
      const size = getNodeSize(node) * scale;

      const dist = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
      if (dist <= size) {
        setSelectedSkill(node);
        return;
      }
    }

    setSelectedSkill(null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const positions = nodePositions.current;
    const { scale, offsetX, offsetY, isDragging, lastX, lastY } = viewState;

    if (isDragging) {
      setViewState({
        ...viewState,
        offsetX: offsetX + (e.clientX - lastX),
        offsetY: offsetY + (e.clientY - lastY),
        lastX: e.clientX,
        lastY: e.clientY,
      });
      return;
    }

    // Check for hover
    for (const node of graph) {
      const pos = positions.get(node.id);
      if (!pos) continue;

      const nodeX = pos.x * scale + offsetX;
      const nodeY = pos.y * scale + offsetY;
      const size = getNodeSize(node) * scale;

      const dist = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
      if (dist <= size) {
        setHoveredSkill(node.id);
        canvas.style.cursor = 'pointer';
        return;
      }
    }

    setHoveredSkill(null);
    canvas.style.cursor = viewState.isDragging ? 'grabbing' : 'grab';
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setViewState({
      ...viewState,
      isDragging: true,
      lastX: e.clientX,
      lastY: e.clientY,
    });
  };

  const handleMouseUp = () => {
    setViewState({
      ...viewState,
      isDragging: false,
    });
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.2, Math.min(3, viewState.scale * zoomFactor));
    setViewState({ ...viewState, scale: newScale });
  };

  const sortedSkills = [...graph].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'category':
        return a.category.localeCompare(b.category);
      case 'references':
      default:
        return b.references - a.references;
    }
  });

  if (loading) {
    return (
      <div className="app-shell">
        <div className="app-backdrop" aria-hidden="true" />
        <nav className="app-nav">
          <div className="nav-left">
            <div className="brand-mark">
              <span className="brand-orb" />
              <span className="brand-text">MySkills_Protocol</span>
            </div>
          </div>
          <div className="nav-right">
            <div className="nav-links-container">
              <Link href="/" className="nav-link">HOME</Link>
              <Link href="/skills-map" className="nav-link text-[var(--neon-green)]">SKILL MAP</Link>
              <Link href="/services" className="nav-link">SERVICES</Link>
            </div>
          </div>
        </nav>
        <main className="app-main flex items-center justify-center">
          <div className="text-center">
            <div className="loading-orb mx-auto mb-6"></div>
            <p className="text-[var(--neon-green)] font-['Rajdhani'] text-xl">Loading skill graph...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="app-backdrop" aria-hidden="true" />

      <nav className="app-nav">
        <div className="nav-left">
          <div className="brand-mark">
            <span className="brand-orb" />
            <span className="brand-text">MySkills_Protocol</span>
          </div>
        </div>
        <div className="nav-right">
          <div className="nav-links-container">
            <Link href="/" className="nav-link">HOME</Link>
            <Link href="/skills-map" className="nav-link text-[var(--neon-green)]">SKILL MAP</Link>
            <Link href="/services" className="nav-link">SERVICES</Link>
          </div>
        </div>
      </nav>

      <main className="app-main">
        <section className="hero">
          <div className="hero-copy">
            <span className="hero-kicker">SKILL_RELATIONSHIP_MAP_v1.0</span>
            <h1 className="hero-title">
              <span>AGENT</span> <span>CONNECTIONS</span>
            </h1>
            <p className="hero-subtitle">
              Visualize how AI agents reference and depend on each other
            </p>
          </div>
        </section>

        <section className="skills-section">
          {/* View Toggle */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setViewMode('graph')}
              className={`view-toggle-btn ${viewMode === 'graph' ? 'active' : ''}`}
            >
              🕸️ GRAPH_VIEW
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            >
              📋 LIST_VIEW
            </button>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="skills-stats-grid mb-8">
              <div className="stat-card">
                <div className="stat-label">Total Skills</div>
                <div className="stat-value text-[var(--neon-green)]">{stats.totalSkills}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Relationships</div>
                <div className="stat-value text-[var(--neon-blue)]">{stats.totalRelationships}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Connected Skills</div>
                <div className="stat-value text-[var(--warning-orange)]">{stats.skillsWithReferences}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Avg Connections</div>
                <div className="stat-value text-[var(--neon-purple)]">
                  {stats.referencesPerSkill.toFixed(1)}
                </div>
              </div>
              <div className="stat-card col-span-2">
                <div className="stat-label">Most Referenced</div>
                <div className="stat-value text-[var(--neon-green)]">
                  {stats.mostReferenced?.name} ({stats.mostReferenced?.references})
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="graph-legend glass-card mb-6">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-muted)] font-['Rajdhani'] text-sm">Platforms:</span>
                <div className="flex gap-3">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-[var(--warning-orange)]"></div>
                    <span className="text-[var(--text-secondary)] font-['Rajdhani'] text-sm">Coze</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-[var(--neon-green)]"></div>
                    <span className="text-[var(--text-secondary)] font-['Rajdhani'] text-sm">Claude Code</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-[var(--neon-blue)]"></div>
                    <span className="text-[var(--text-secondary)] font-['Rajdhani'] text-sm">Manus</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-[var(--neon-purple)]"></div>
                    <span className="text-[var(--text-secondary)] font-['Rajdhani'] text-sm">MiniMax</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-muted)] font-['Rajdhani'] text-sm">Relations:</span>
                <div className="flex gap-3">
                  <div className="flex items-center gap-1">
                    <div className="w-8 h-0.5 bg-[var(--warning-orange)]"></div>
                    <span className="text-[var(--text-secondary)] font-['Rajdhani'] text-sm">Depends</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-8 h-0.5 bg-[var(--neon-green)]"></div>
                    <span className="text-[var(--text-secondary)] font-['Rajdhani'] text-sm">Uses</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-8 h-0.5 bg-[var(--neon-blue)]"></div>
                    <span className="text-[var(--text-secondary)] font-['Rajdhani'] text-sm">Complements</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-8 h-0.5 bg-[var(--neon-purple)]"></div>
                    <span className="text-[var(--text-secondary)] font-['Rajdhani'] text-sm">Similar</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {viewMode === 'graph' ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Canvas Area */}
              <div className="lg:col-span-3">
                <div className="graph-container glass-card">
                  <div className="graph-header">
                    <span className="text-[var(--text-muted)] font-['Rajdhani'] text-sm">
                      Interactive Graph (drag to pan, scroll to zoom)
                    </span>
                    <button
                      onClick={() => setViewState({ scale: 1, offsetX: 0, offsetY: 0, isDragging: false, lastX: 0, lastY: 0 })}
                      className="reset-view-btn"
                    >
                      ↺ Reset
                    </button>
                  </div>
                  <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={handleWheel}
                    className="graph-canvas cursor-grab active:cursor-grabbing"
                  />
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                {selectedSkill ? (
                  <div className="glass-card skill-detail-selected">
                    <h3 className="text-xl font-['Orbitron'] text-[var(--neon-green)] mb-4">
                      {selectedSkill.name}
                    </h3>
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)] font-['Rajdhani']">Category:</span>
                        <span className="text-[var(--text-secondary)] font-['Rajdhani']">{selectedSkill.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)] font-['Rajdhani']">Platform:</span>
                        <span className="text-[var(--text-secondary)] font-['Rajdhani']">{selectedSkill.platform}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)] font-['Rajdhani']">Referenced by:</span>
                        <span className="text-[var(--neon-green)] font-['Orbitron']">{selectedSkill.references} skills</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-[var(--neon-blue)] font-['Rajdhani'] font-semibold mb-2">
                        Referenced By ({selectedSkill.referencedBy.length})
                      </h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {selectedSkill.referencedBy.map(id => {
                          const skill = graph.find(s => s.id === id);
                          return skill ? (
                            <div key={id} className="text-sm text-[var(--text-secondary)] font-['Rajdhani'] truncate">
                              {skill.name}
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-[var(--warning-orange)] font-['Rajdhani'] font-semibold mb-2">
                        Uses ({selectedSkill.referencesTo.length})
                      </h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {selectedSkill.referencesTo.map(id => {
                          const skill = graph.find(s => s.id === id);
                          return skill ? (
                            <div key={id} className="text-sm text-[var(--text-secondary)] font-['Rajdhani'] truncate">
                              {skill.name}
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedSkill(null)}
                      className="ghost-btn w-full"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <div className="glass-card">
                    <h3 className="text-lg font-['Orbitron'] text-[var(--neon-green)] mb-4">
                      Top Referenced Skills
                    </h3>
                    <div className="space-y-2">
                      {sortedSkills.slice(0, 8).map(skill => (
                        <button
                          key={skill.id}
                          onClick={() => setSelectedSkill(skill)}
                          className="skill-list-item"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[var(--text-secondary)] font-['Rajdhani'] text-sm truncate group-hover:text-[var(--neon-green)]">
                              {skill.name}
                            </span>
                            <span className="text-[var(--neon-green)] font-['Orbitron'] text-sm ml-2">
                              {skill.references}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* List View */
            <div className="glass-card skills-list-container">
              <div className="skills-list-header">
                <span className="text-[var(--text-muted)] font-['Rajdhani']">Skills by Reference Count</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="filter-select"
                >
                  <option value="references">By References</option>
                  <option value="name">By Name</option>
                  <option value="category">By Category</option>
                </select>
              </div>
              <div className="divide-y divide-[rgba(255,255,255,0.05)]">
                {sortedSkills.map((skill, index) => (
                  <button
                    key={skill.id}
                    onClick={() => setSelectedSkill(skill)}
                    className="skill-list-row w-full text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <span className={`rank-badge ${
                        index === 0 ? 'rank-gold' :
                        index === 1 ? 'rank-silver' :
                        index === 2 ? 'rank-bronze' :
                        'rank-default'
                      }`}>
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--text-secondary)] font-['Rajdhani'] group-hover:text-[var(--neon-green)] truncate">
                            {skill.name}
                          </span>
                          <span className="platform-badge">
                            {skill.category}
                          </span>
                        </div>
                        <div className="text-[var(--text-muted)] font-['Rajdhani'] text-sm">
                          {skill.platform}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-['Orbitron'] text-[var(--neon-green)]">
                          {skill.references}
                        </div>
                        <div className="text-[var(--text-muted)] font-['Rajdhani'] text-xs">
                          references
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
