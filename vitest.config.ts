import { defineConfig } from 'vitest/config';

/**
 * Vitest 配置（REQ-044）。
 *
 * 本仓库此前**没有**任何 vitest 配置，于是所有用例都在默认预算下运行：
 * 用例 5 s、钩子 10 s。而本套件里有大量「`execSync` 拉起 `node dist/cli.js`
 * 子进程」与「写入/删除上百个文件」的用例 —— 单个 `node` 进程在这类环境下的
 * 冷启动就要 1~3 s，5 s 预算必然误杀。实测（2026-09-20，默认预算）：
 * 42 个文件里 15 个用例因 `Test timed out in 5000ms` 失败，而这些用例在
 * 30 s 预算下全部通过。
 *
 * 这里把预算调成与「真实子进程成本」相称的量级，而不是继续用 `--testTimeout`
 * 之类的临时参数 —— 否则干净克隆上的 `npm test` 永远不可能直接通过。
 */
export default defineConfig({
  test: {
    testTimeout: 60000,
    hookTimeout: 60000,
    /**
     * 限制并发 worker 数（本机 12 核 → 默认会开 11 个）。
     *
     * 本套件里有大量「每个用例都 `spawn` 若干 `node` 子进程 + 反复建删目录」的
     * 集成测试；worker 越多，彼此对进程创建与文件系统的争用越重，单个用例的
     * 墙钟时间被拉长（实测：uninstall 类用例单独跑 12~16 s，在全量并行下会
     * 超过 30 s）。把并发压到 4 既稳定又不明显损失总时长 —— 瓶颈在 syscall
     * 而非 CPU。
     */
    maxWorkers: 4,
    // 生成的审查报告目录不属于测试源。默认 exclude 只含 node_modules/dist 等，
    // 放在 `.audit-reports/` 下的 `*.test.ts` 探针会被误收集并执行。
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.audit-reports/**',
    ],
  },
});
