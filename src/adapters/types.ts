/**
 * Adapter interface layer - tool-agnostic definitions
 *
 * Provides a portable format for agents, skills, and commands
 * that can be adapted to any AI coding tool (OpenCode, Claude Code, Codex, etc.).
 */

// ============================================================================
// Agent definitions
// ============================================================================

export type AgentRole = 'primary' | 'subagent';

export interface AgentPermissions {
  write: boolean;
  edit: boolean;
  bash: boolean;
  mcp?: boolean;
}

export interface AgentDef {
  id: string;
  name: string;
  description: string;
  role: AgentRole;
  permissions: AgentPermissions;
  /** Relative path to the prompt markdown file */
  promptFile: string;
  /** Full prompt content (body after frontmatter, tool-agnostic) */
  promptContent: string;
  /** Optional model override (tool-specific, may be ignored) */
  model?: string;
  /** Optional temperature override */
  temperature?: number;
}

// ============================================================================
// Skill definitions
// ============================================================================

export interface SkillDef {
  id: string;
  name: string;
  description?: string;
  /** Relative path to the skill prompt file */
  promptFile: string;
  /** Full skill content, when available */
  promptContent?: string;
}

// ============================================================================
// Command definitions
// ============================================================================

export interface CommandDef {
  id: string;
  name: string;           // e.g. "/patent-new"
  description: string;
  /** Relative path to the command prompt file */
  promptFile: string;
  /** Full command prompt content, when available */
  promptContent?: string;
}

// ============================================================================
// MCP server definition
// ============================================================================

export type MCPTransportType = 'local' | 'remote';

export interface MCPServerDef {
  id: string;
  transport: MCPTransportType;
  command?: string[];       // For local transports
  url?: string;             // For remote transports
  environment?: Record<string, string>;
  enabled: boolean;
}

// ============================================================================
// Plugin config schema
// ============================================================================

export interface ConfigField {
  type: 'string' | 'number' | 'boolean';
  default?: unknown;
  enum?: string[];
  description: string;
}

export interface PluginConfig {
  [key: string]: ConfigField;
}

// ============================================================================
// Complete portable definition
// ============================================================================

export interface PortableDef {
  name: string;
  version: string;
  agents: AgentDef[];
  skills: SkillDef[];
  commands: CommandDef[];
  mcpServers: MCPServerDef[];
  config: PluginConfig;
}

// ============================================================================
// Adapter interface
// ============================================================================

export interface GenerateResult {
  /** Tool-specific config files to write, keyed by relative path */
  files: Map<string, string>;
  /** Human-readable instructions for post-generation steps */
  instructions: string[];
}

export interface ToolAdapter {
  readonly name: string;

  /**
   * Generate tool-specific configuration files from portable definitions.
   * @param def    Portable plugin definition
   * @param config Resolved config values
   * @returns      Map of file paths to content, plus instructions
   */
  generate(def: PortableDef, config: Record<string, unknown>): Promise<GenerateResult>;

  /**
   * Uninstall (clean up) tool-specific configuration files from the given workspace.
   * @param def           Portable plugin definition (used to derive file names)
   * @param workspaceDir  Workspace directory to clean up
   * @returns             Human-readable instructions and a flag for whether files were cleaned
   */
  uninstall(def: PortableDef, workspaceDir: string): Promise<{ filesRemoved: string[]; filesSkipped: string[]; success: boolean; message: string }>;

  /**
   * Return the list of file paths (relative to workspaceDir) that this adapter generates.
   * Used by the CLI to know exactly what to clean up.
   * @param def  Portable plugin definition
   * @returns    List of relative file paths
   */
  getGeneratedFilePaths(def: PortableDef): string[];
}
