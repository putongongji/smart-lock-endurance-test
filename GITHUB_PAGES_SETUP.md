# GitHub Pages 部署说明

## 自动部署已配置完成

项目已经配置了 GitHub Pages 的自动部署功能，包括：

1. ✅ **Vite 配置更新** - 设置了正确的 base 路径
2. ✅ **GitHub Actions 工作流** - 自动构建和部署
3. ✅ **部署脚本** - 添加了 npm run deploy 命令
4. ✅ **依赖安装** - 安装了 gh-pages 包

## 需要手动启用 GitHub Pages

请按照以下步骤在 GitHub 仓库中启用 Pages 功能：

### 步骤 1: 进入仓库设置
1. 访问你的 GitHub 仓库：https://github.com/putongongji/smart-lock-endurance-test
2. 点击仓库顶部的 **Settings** 标签

### 步骤 2: 配置 Pages
1. 在左侧菜单中找到并点击 **Pages**
2. 在 "Source" 部分选择 **GitHub Actions**
3. 保存设置

### 步骤 3: 等待部署
1. GitHub Actions 会自动运行并部署你的网站
2. 部署完成后，你的网站将可以通过以下地址访问：
   ```
   https://putongongji.github.io/smart-lock-endurance-test/
   ```

## 后续使用

每次你推送代码到 `main` 分支时，GitHub Actions 会自动：
1. 构建你的 React 应用
2. 部署到 GitHub Pages
3. 更新在线网站

## 本地部署测试

你也可以在本地测试部署：

```bash
# 构建项目
npm run build

# 手动部署到 GitHub Pages
npm run deploy
```

## 常见问题解决

### 部署错误：Git 退出代码 128

如果遇到 "The process '/usr/bin/git' failed with exit code 128" 错误，这通常是权限问题。解决方案：

1. **检查仓库设置**：
   - 进入 GitHub 仓库 Settings → Actions → General
   - 在 "Workflow permissions" 部分选择 "Read and write permissions"
   - 勾选 "Allow GitHub Actions to create and approve pull requests"

2. **手动启用 Pages**：
   - 进入 Settings → Pages
   - Source 选择 "GitHub Actions"
   - 保存设置

3. **重新运行工作流**：
   - 进入 Actions 标签页
   - 选择失败的工作流
   - 点击 "Re-run jobs"

### 网络连接问题

如果本地推送失败，可以：

1. **等待网络恢复后重试**：
   ```bash
   git push origin main
   ```

2. **使用 GitHub 网页界面**：
   - 直接在 GitHub 网页上编辑文件
   - 提交更改会自动触发部署

## 注意事项

- 确保仓库是公开的，或者你有 GitHub Pro 账户（私有仓库需要付费才能使用 Pages）
- 首次部署可能需要几分钟时间
- 如果遇到问题，可以在仓库的 Actions 标签页查看部署日志
- 工作流已经配置了正确的权限，应该能够自动部署