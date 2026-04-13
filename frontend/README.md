# Frontend (Static Vue MVP)

当前前端采用单文件静态页面：`index.html`。

运行方式：

```bash
cd frontend
python3 -m http.server 5174
```

浏览器访问：

- http://127.0.0.1:5174/

说明：
- 项目中仍保留了 Vite 脚手架文件（`src/`, `package.json` 等），但当前 MVP 不依赖 Vite 构建。
- 若后续要切换为 Vite 方案，再把问答页面迁移到 `src/App.vue` 即可。
