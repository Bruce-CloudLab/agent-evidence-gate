# Launch Post Copy

## Short Chinese

我刚发布了一个小型开源项目：Agent Evidence Gate。

它解决一个很常见的问题：AI 编程代理总说“我修好了”，但 reviewer 还得自己确认有没有测试证据、有没有动危险文件、有没有留下调试代码。

Agent Evidence Gate 做的事很简单：读取 PR diff、`AGENTS.md` 里的 `agent-evidence` policy、代理提交的 evidence 文本，然后输出 `Ready` / `Not Ready` scorecard。

它不是 `AGENTS.md` linter。它问的是一个更窄的问题：这次 agent 交付的改动，真的有足够证据进入人工 review 吗？

核心原则：Evidence before claims.

Repo: https://github.com/Bruce-CloudLab/agent-evidence-gate

## Short English

I just released Agent Evidence Gate, a small open-source gate for AI coding-agent pull requests.

It checks the delivered diff against project evidence rules: required test runs, protected paths, forbidden debug leftovers, changed-file limits, and completion claims backed by command evidence.

It is not an `AGENTS.md` linter. It asks a narrower question: is this agent-delivered change actually ready for human review?

Evidence before claims.

Repo: https://github.com/Bruce-CloudLab/agent-evidence-gate

## Compact English

Agent Evidence Gate is a deterministic CLI + GitHub Action that keeps AI coding-agent PRs honest: policy + diff + evidence in, `Ready` / `Not Ready` scorecard out.

It checks test evidence, protected paths, debug leftovers, file-change limits, and completion claims.

Evidence before claims.

https://github.com/Bruce-CloudLab/agent-evidence-gate