# My Portfolio Extraction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `law-assistant/my-portfolio` 提取为同级独立项目 `/home/qisen/projects/my-portfolio`，并只迁移可维护的源码与配置文件。

**Architecture:** 保留原有 Next.js 项目的源码和配置边界，不引入 monorepo 改造。迁移通过“创建目标目录 + 复制保留文件 + 结构校验”完成，避免携带缓存和构建产物。

**Tech Stack:** Bash, Next.js, TypeScript, npm

---

### Task 1: Create The Target Project Directory

**Files:**
- Create: `/home/qisen/projects/my-portfolio`

- [ ] **Step 1: Create the destination directory**

```bash
mkdir -p /home/qisen/projects/my-portfolio
```

- [ ] **Step 2: Verify the directory exists**

Run: `ls -d /home/qisen/projects/my-portfolio`
Expected: prints `/home/qisen/projects/my-portfolio`

### Task 2: Copy Source And Config Files

**Files:**
- Copy: `my-portfolio/src`
- Copy: `my-portfolio/public`
- Copy: `my-portfolio/.gitignore`
- Copy: `my-portfolio/README.md`
- Copy: `my-portfolio/package.json`
- Copy: `my-portfolio/package-lock.json`
- Copy: `my-portfolio/tsconfig.json`
- Copy: `my-portfolio/next-env.d.ts`
- Copy: `my-portfolio/next.config.ts`
- Copy: `my-portfolio/postcss.config.mjs`
- Copy: `my-portfolio/eslint.config.mjs`

- [ ] **Step 1: Copy the selected project files**

```bash
cp -R my-portfolio/src my-portfolio/public /home/qisen/projects/my-portfolio/
cp my-portfolio/.gitignore my-portfolio/README.md my-portfolio/package.json my-portfolio/package-lock.json my-portfolio/tsconfig.json my-portfolio/next-env.d.ts my-portfolio/next.config.ts my-portfolio/postcss.config.mjs my-portfolio/eslint.config.mjs /home/qisen/projects/my-portfolio/
```

- [ ] **Step 2: Verify excluded directories were not copied**

Run: `find /home/qisen/projects/my-portfolio -maxdepth 1 \\( -name node_modules -o -name .next \\)`
Expected: no output

### Task 3: Verify The Extracted Project Structure

**Files:**
- Verify: `/home/qisen/projects/my-portfolio`

- [ ] **Step 1: List the extracted project files**

Run: `find /home/qisen/projects/my-portfolio -maxdepth 2 -type f | sort`
Expected: includes `package.json`, `next.config.ts`, `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`

- [ ] **Step 2: Confirm the original source directory is still present**

Run: `ls -d /home/qisen/projects/law-assistant/my-portfolio`
Expected: prints the original source directory path
