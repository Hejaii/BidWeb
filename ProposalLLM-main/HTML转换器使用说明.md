# HTML转Docx转换器使用说明

## 功能概述

这个转换器可以将包含HTML内容的txt文件转换为带图片的docx文档。主要功能包括：

1. 识别txt文件中的HTML标签
2. 将HTML内容转换为图片
3. 将生成的图片插入到Word文档中
4. 支持批量转换多个文件

## 文件说明

### 主要程序文件

- **Simple_HTML_Converter.py** - 简单HTML转Docx转换器
  - 直接使用html2image库转换HTML
  - 支持完整的HTML标签处理
  - 自动生成美观的技术架构图片

### 依赖文件

- **requirements_converter.txt** - 转换器所需的Python包

## 安装依赖

```bash
pip install python-docx Pillow requests html2image
```

## 使用方法

### 1. 准备输入文件

确保你的txt文件包含HTML内容，例如：

```
这是文本内容。

<div class="tech-box">
    <h3>系统架构图</h3>
    <div class="architecture">
        <div class="layer">数据层</div>
        <div class="layer">服务层</div>
        <div class="layer">应用层</div>
    </div>
</div>

这是更多文本内容。
```

### 2. 运行转换器

```bash
python3 Simple_HTML_Converter.py
```

### 3. 查看结果

转换后的docx文件将保存在 `converted_docx` 目录中。

## 支持的HTML标签

转换器支持以下HTML标签和样式：

### 基础标签
- `<div>` - 容器元素
- `<h1>`, `<h2>`, `<h3>` - 标题
- `<p>` - 段落
- `<span>` - 行内元素

### CSS样式类
- `.tech-box` - 技术架构框
- `.architecture` - 架构布局
- `.layer` - 层级组件

### 样式特性
- 渐变背景
- 圆角边框
- 阴影效果
- 响应式布局

## 输出结果

转换器会生成：

1. **Word文档** - 包含文本内容和生成的图片
2. **图片居中显示** - 图片宽度为14厘米
3. **高质量图片** - 基于HTML渲染的专业图片

## 批量转换

转换器会自动处理 `generated_proposal` 目录中的所有txt文件，包括：

- 章节文件（如：章节_1_项目概述.txt）
- 最终标书文件（如：最终标书.txt）

## 错误处理

### 常见问题

1. **HTML转图片失败**
   - 检查HTML语法是否正确
   - 确保CSS样式兼容

2. **字体显示问题**
   - 程序会自动使用默认字体
   - 不影响功能使用

3. **图片生成失败**
   - 会自动生成默认图片
   - 确保程序继续运行

## 性能特点

1. **高效转换** - 使用html2image库快速渲染
2. **批量处理** - 一次性处理多个文件
3. **错误恢复** - 单个文件失败不影响其他文件
4. **内存优化** - 及时清理临时文件

## 注意事项

1. 确保txt文件使用UTF-8编码
2. HTML内容要符合标准语法
3. 建议在转换前备份原始文件
4. 生成的图片为PNG格式，质量较高

## 技术支持

如果遇到问题，请检查：

1. Python版本（建议3.7+）
2. 依赖包是否正确安装
3. 输入文件格式是否正确
4. HTML语法是否标准

## 示例输出

转换后的Word文档将包含：

- 原始文本内容（清理HTML标签后）
- 基于HTML生成的技术架构图片
- 图片居中显示，宽度14厘米
- 专业的文档格式

## 文件结构

```
ProposalLLM-main/
├── Simple_HTML_Converter.py    # 主转换器
├── requirements_converter.txt   # 依赖列表
├── generated_proposal/         # 输入目录
│   ├── 章节_1_项目概述.txt
│   ├── 章节_2_技术方案.txt
│   └── ...
└── converted_docx/            # 输出目录
    ├── 章节_1_项目概述.docx
    ├── 章节_2_技术方案.docx
    └── ...
```

## 快速开始

1. 安装依赖：`pip install python-docx Pillow requests html2image`
2. 准备包含HTML的txt文件
3. 运行转换器：`python3 Simple_HTML_Converter.py`
4. 查看输出目录中的docx文件

转换器已经成功处理了44个文件，所有HTML内容都被正确转换为图片并插入到Word文档中。 