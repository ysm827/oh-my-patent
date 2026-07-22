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
1. Uses MCP servers to search for prior art (google_scholar, uspto_patent, cnipa_patent, semantic_scholar)
2. Generates `references/landscape_{topic_slug}.md` (main landscape report)
3. Generates `references/feature-matrix_{topic_slug}.md` (feature comparison matrix)
4. Generates `references/problem-map_{topic_slug}.md` (technical problem mapping)
5. Creates individual evidence cards for high-value results

## Example
```
/patent-search 零知识证明 跨境支付 隐私保护
```

## Output
```
Search completed: 15 results found
Results saved to: references/landscape_blockchain-crossborder-payment.md
```
