# /patent-search

<!-- Generated for Codex by oh-my-patent. -->
<!-- Command: patent-search -->

专利检索

## Usage In Codex

When the user writes `/patent-search`, follow this command prompt in the current workspace and obey AGENTS.md.

## Prompt

# Command: /patent-search

## Description
Search for existing patents and prior art.

## Usage
```
/patent-search <query>
```

## Parameters
- `query`: Search keywords (required)

## Behavior
1. Uses MCP servers to search for prior art
2. Generates `references/landscape_{topic_slug}.md`
3. Creates individual evidence cards for high-value results

## Example
```
/patent-search 零知识证明 跨境支付 隐私保护
```

## Output
```
Search completed: 15 results found
Results saved to: references/landscape_blockchain-crossborder-payment.md
```
