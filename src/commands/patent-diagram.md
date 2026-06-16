---
name: patent-diagram
description: 生成、重渲染或查看专利附图
---

# /patent-diagram — 专利附图命令

## 用法

```
/patent-diagram [action] [options]
```

## 操作

| Action | 说明 |
|--------|------|
| `generate` | 读取 MAIN.md，生成全部附图（默认操作） |
| `regenerate <figureId>` | 重新生成指定图 |
| `status` | 查看当前图渲染状态 |
| `render <figureId>` | 仅重新渲染指定图（不修改源码） |

## 示例

- `/patent-diagram` — 生成全部附图
- `/patent-diagram generate` — 同上
- `/patent-diagram regenerate fig1_system_architecture` — 重新生成图1
- `/patent-diagram status` — 查看渲染状态

## 流程

1. 确认当前项目目录和 MAIN.md 存在
2. 调用 `@patent-diagram-generator` agent 执行对应操作
3. 报告渲染结果和文件位置
