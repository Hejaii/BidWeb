# 智能标书生成系统

基于AI技术的专业标书生成平台，采用Next.js + FastAPI + OpenAI技术栈构建。

## 项目特性

- **智能分析**: 自动解析招标文件，提取关键需求信息
- **快速生成**: 基于AI技术，快速生成专业标书内容
- **专业输出**: 支持多种格式输出，确保标书质量达到专业标准
- **现代化UI**: 采用Tailwind CSS设计，界面美观易用

## 技术架构

- **前端**: Next.js 14.0.0 + React 18 + TypeScript + Tailwind CSS
- **后端**: FastAPI + Python 3.8+
- **AI服务**: OpenAI API
- **文档处理**: python-docx, openpyxl

## 环境要求

- Node.js 18.0.0 或更高版本
- Python 3.8 或更高版本
- npm 或 yarn 包管理器

## 安装依赖

### 前端依赖安装

```bash
# 进入项目根目录
cd /Users/leojiang/PycharmProjects/标书_副本

# 安装Node.js依赖
npm install
```

### 后端依赖安装

```bash
# 进入后端目录
cd backend

# 安装Python依赖
pip install -r requirements.txt
```

## 运行方式

### 启动前端服务

```bash
# 在项目根目录下运行
npm run dev
```

前端服务将在 http://localhost:3000 启动

### 启动后端服务

```bash
# 在backend目录下运行
cd backend
python main.py
```

后端API服务将启动（具体端口请查看main.py配置）

### 一键启动

```bash
# 在项目根目录下同时启动前后端服务
npm run dev & cd backend && python main.py
```

## 项目结构

```
标书_副本/
├── app/                    # Next.js前端应用
│   ├── fulltext/          # 全文页面
│   ├── generate/          # 生成页面
│   ├── health/            # 健康检查页面
│   ├── outline/           # 大纲页面
│   ├── upload/            # 上传页面
│   └── layout.tsx         # 布局组件
├── backend/               # FastAPI后端服务
│   ├── main.py           # 主服务文件
│   ├── requirements.txt   # Python依赖
│   └── temp/             # 临时文件目录
├── ProposalLLM-main/      # 核心业务逻辑
│   ├── Generate.py       # 标书生成模块
│   ├── Extract_Word.py   # Word文档提取
│   └── converted_docx/   # 转换后的文档
├── package.json           # Node.js项目配置
└── tailwind.config.js     # Tailwind CSS配置
```

## 使用说明

1. **上传招标文件**: 在网页界面中上传招标文档
2. **智能分析**: 系统自动分析文档内容，提取关键需求
3. **生成标书**: 基于分析结果，AI自动生成专业标书内容
4. **下载输出**: 支持多种格式下载生成的标书

## 开发命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务
npm start

# 代码检查
npm run lint
```

## 注意事项

- 确保已正确配置OpenAI API密钥
- 前端服务默认运行在3000端口
- 后端服务端口配置请查看main.py文件
- 首次运行需要安装所有依赖包

## 故障排除

### 常见问题

1. **端口占用**: 如果3000端口被占用，Next.js会自动选择其他可用端口
2. **依赖安装失败**: 确保Node.js和Python版本符合要求
3. **API连接失败**: 检查后端服务是否正常启动

### 日志查看

```bash
# 查看前端服务日志
npm run dev

# 查看后端服务日志
cd backend && python main.py
```

## 许可证

本项目采用MIT许可证，详见LICENSE文件。

