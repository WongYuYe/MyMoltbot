# MyMoltbot - Vue 3 Todo List 网页应用

这是一个基于 Vue 3 开发的待办事项（Todo List）网页应用。

## 功能特性

- 添加新的待办事项
- 标记完成/未完成状态
- 删除待办事项
- 实时统计（总数量、待完成、已完成）
- 本地数据持久化
- 响应式设计，支持深色模式

## 技术栈

- Vue 3 (Composition API)
- Vite 构建工具
- 本地存储实现数据持久化

## 文件结构

```
├── README.md
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.js
│   └── App.vue
└── dist/                      # 构建输出目录
```

## 预览地址

[在线预览页面](https://wongyuye.github.io/MyMoltbot/)

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 功能说明

- 在顶部输入框中输入待办事项内容
- 点击"添加"按钮或按回车键添加待办事项
- 点击复选框标记完成/未完成状态
- 点击"删除"按钮移除待办事项
- 底部实时显示统计信息