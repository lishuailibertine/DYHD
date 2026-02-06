# 将项目同步到本地 Mac

本指南帮助你将扣子编程环境中的项目代码同步到你的 Mac 电脑上。

## 📋 前提条件

- ✅ 已安装 [Git](https://git-scm.com/)
- ✅ 已安装 [Node.js](https://nodejs.org/) (版本 18 或更高)
- ✅ 已安装 [pnpm](https://pnpm.io/)
- ✅ 拥有一个 GitHub 账号

---

## 🚀 方法1：通过 GitHub 同步（推荐）⭐

### 步骤1：在 GitHub 创建仓库

1. 访问 https://github.com/new
2. 填写仓库信息：
   - Repository name: `douyin-game` (或你喜欢的名称)
   - Description: `抖音互动游戏系统`
   - Public/Private: 根据你的需求选择
   - **不要勾选** "Add a README file"（因为我们会推送已有代码）
3. 点击 "Create repository"

### 步骤2：在扣子环境推送代码

在扣子编程环境的终端中运行：

```bash
cd /workspace/projects

# 配置 Git 用户信息（如果还没配置）
git config user.name "你的GitHub用户名"
git config user.email "your-email@example.com"

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/douyin-game.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

**如果遇到认证问题**，需要使用 Personal Access Token：

1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token" → "Generate new token (classic)"
3. 选择权限：`repo` (勾选所有子项)
4. 生成 token 并复制

然后使用 token 推送：

```bash
git remote set-url origin https://YOUR_TOKEN@github.com/你的用户名/douyin-game.git
git push -u origin main
```

### 步骤3：在 Mac 本地克隆项目

在你的 Mac 终端中运行：

```bash
# 克隆项目到指定目录
cd ~/Desktop  # 或任何你想要的目录
git clone https://github.com/你的用户名/douyin-game.git

# 进入项目目录
cd douyin-game

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 步骤4：在 VSCode 中打开

```bash
# 在项目目录中运行
code .
```

或者在 VSCode 中：
1. 打开 VSCode
2. 点击 `File` → `Open Folder`
3. 选择 `douyin-game` 文件夹

---

## 🔄 方法2：使用 Git 手动同步

如果你不想使用 GitHub，可以使用其他 Git 托管平台：

### 支持的平台

- **Gitee (码云)** - 国内访问快：https://gitee.com
- **GitLab** - 企业级：https://gitlab.com
- **Coding** - 腾讯云：https://coding.net

### 步骤（以 Gitee 为例）

1. **创建仓库**
   - 访问 https://gitee.com/projects/new
   - 创建空仓库

2. **在扣子环境推送**
   ```bash
   cd /workspace/projects
   git remote add origin https://gitee.com/你的用户名/douyin-game.git
   git push -u origin main
   ```

3. **在 Mac 本地克隆**
   ```bash
   git clone https://gitee.com/你的用户名/douyin-game.git
   ```

---

## 📦 方法3：使用 rsync 直接复制（不推荐）

如果你想直接复制文件到本地（需要 SSH 访问）：

```bash
# 在 Mac 本地运行
rsync -avz user@server:/workspace/projects/ ~/Desktop/douyin-game/
```

**注意**：这个方法需要你有服务器的 SSH 访问权限。

---

## ✅ 验证同步成功

在 Mac 本地运行：

```bash
# 检查文件结构
ls -la

# 查看 Git 历史
git log --oneline

# 启动项目
pnpm dev
```

访问 `http://localhost:5000` 确认项目正常运行。

---

## 🔄 日常开发工作流

### 从扣子环境同步到本地

```bash
# 在扣子环境
cd /workspace/projects
git add .
git commit -m "更新代码"
git push

# 在 Mac 本地
cd douyin-game
git pull
```

### 从本地推送到扣子环境

```bash
# 在 Mac 本地
git add .
git commit -m "本地修改"
git push

# 在扣子环境
cd /workspace/projects
git pull
```

---

## 🎯 推荐工作流程

1. **开发阶段**：在 Mac 本地 VSCode 中编辑
2. **测试阶段**：在扣子环境中运行测试
3. **同步代码**：通过 GitHub 双向同步
4. **部署上线**：使用 GitHub Actions 或手动部署

---

## ❓ 常见问题

### Q1: 推送时提示 "authentication failed"

A: 需要使用 Personal Access Token：
1. 在 GitHub 创建 token
2. 使用 token 作为密码

### Q2: 克隆后无法运行 `pnpm dev`

A: 需要安装依赖：
```bash
pnpm install
```

### Q3: Git 提示 "nothing to commit"

A: 说明代码已经是最新的，可以继续开发。

### Q4: 如何查看远程仓库地址？

```bash
git remote -v
```

---

## 💡 最佳实践

1. **频繁提交** - 每完成一个功能就提交
2. **写清楚 commit 信息** - 方便追踪历史
3. **使用分支** - 开发新功能时创建新分支
4. **定期同步** - 避免代码冲突

---

## 🎉 开始同步吧！

现在你已经了解了所有方法，选择最适合你的方式开始同步吧！

**如果你有 GitHub 账号，推荐使用方法1（通过 GitHub 同步）**，这是最简单和最常用的方式。
