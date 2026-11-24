# Boyu 的个人网站

Next.js App Router 提供文章归档与管理后台。现有主页、相册、旅行、媒体和 Ethicraft 页面从 `public/` 提供，旧文章链接永久重定向至新的 Markdown 页面。

- 博客 `/blog`
- 后台 `/admin`
- 网站浏览量与来源在 Vercel Web Analytics 查看

## 本地运行

使用 Node.js 22 或 24，执行 `npm install` 和 `npm run dev`。未配置存储时，博客可读取随仓库迁移的原有文章。

管理员账号为 `boyu`。后台读取服务端环境变量 `BLOG_ADMIN_PASSWORD`（至少 32 个字符）、`BLOG_SESSION_SECRET`（至少 32 个字符）与私有 Vercel Blob 存储的 `BLOB_READ_WRITE_TOKEN`。把开发环境变量放在 `.env.local`。连接的 Blob 存储使用独立的生产和预览目录。在生产环境发布前部署管理员密码与存储变量，Vercel Analytics 在项目控制台管理。

文章使用 Markdown。图片支持 JPG、PNG、WebP 和 GIF，单张最大 4 MB。管理员可编辑已发布文章，也可撤下并转为草稿。文章地址在首次保存后固定。登录后在 `/admin/account/settings` 修改密码，生效后其余设备的旧会话会失效。修改后的密码以加盐 scrypt 哈希存储。

原站 MIT 许可见 LICENSE。
