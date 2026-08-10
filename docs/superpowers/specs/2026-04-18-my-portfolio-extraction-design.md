# My Portfolio Extraction Design

**Context**

`law-assistant` 根目录下目前存在一个未纳入版本控制的 `my-portfolio` 目录。该目录是一个独立的 Next.js 项目，包含源码、静态资源、依赖缓存与构建产物。

**Goal**

将 `my-portfolio` 从 `law-assistant` 仓库中迁移为与当前仓库同级的独立项目目录 `/home/qisen/projects/my-portfolio`，并确保新目录只保留可维护、可重新安装依赖的项目源码与配置。

**Recommended Approach**

采用“选择性迁移源码”的方式，而不是整目录原样搬走。迁移时保留项目源码、资源文件与构建配置，排除 `node_modules`、`.next` 等可再生成内容，避免将缓存、平台相关产物和无用体积带入新项目。

**Files To Keep**

- `src/`
- `public/`
- `.gitignore`
- `README.md`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `next-env.d.ts`
- `next.config.ts`
- `postcss.config.mjs`
- `eslint.config.mjs`

**Files To Exclude**

- `node_modules/`
- `.next/`

**Migration Behavior**

- 在 `/home/qisen/projects/my-portfolio` 创建独立项目目录
- 将保留文件复制到新目录
- 暂不删除 `law-assistant/my-portfolio` 原目录，待用户确认新项目状态正常后再决定是否清理
- 迁移完成后检查新目录结构，确认关键文件齐全

**Validation**

- 新目录包含 Next.js 项目最小可运行结构
- 新目录不包含 `node_modules` 与 `.next`
- 原目录保持不变，避免误删
