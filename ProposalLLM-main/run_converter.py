#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HTML转Docx转换器 - 快速启动脚本
"""

import os
import sys
from Simple_HTML_to_Docx import SimpleHTMLToDocxConverter

def check_dependencies():
    """检查依赖包是否已安装"""
    required_packages = ['docx', 'PIL', 'requests']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print("缺少以下依赖包：")
        for package in missing_packages:
            print(f"  - {package}")
        print("\n请运行以下命令安装：")
        print("pip install python-docx Pillow requests")
        return False
    
    return True

def check_input_files():
    """检查输入文件"""
    input_dir = "generated_proposal"
    
    if not os.path.exists(input_dir):
        print(f"输入目录不存在: {input_dir}")
        print("请确保存在以下目录结构：")
        print("  generated_proposal/")
        print("    ├── 章节_1_项目概述.txt")
        print("    ├── 章节_2_技术方案.txt")
        print("    └── ...")
        return False
    
    txt_files = [f for f in os.listdir(input_dir) if f.endswith('.txt')]
    
    if not txt_files:
        print(f"在 {input_dir} 目录中未找到txt文件")
        return False
    
    print(f"找到 {len(txt_files)} 个txt文件")
    return True

def main():
    """主函数"""
    print("=" * 60)
    print("HTML转Docx转换器 - 快速启动")
    print("=" * 60)
    
    # 检查依赖
    print("1. 检查依赖包...")
    if not check_dependencies():
        return
    
    # 检查输入文件
    print("2. 检查输入文件...")
    if not check_input_files():
        return
    
    # 创建转换器
    print("3. 初始化转换器...")
    converter = SimpleHTMLToDocxConverter()
    
    # 设置输出目录
    input_dir = "generated_proposal"
    output_dir = "converted_docx"
    
    # 开始转换
    print("4. 开始转换...")
    print("-" * 60)
    
    success, total = converter.batch_convert(input_dir, output_dir)
    
    # 显示结果
    print("-" * 60)
    if success > 0:
        print(f"✅ 转换成功！")
        print(f"   成功转换: {success}/{total} 个文件")
        print(f"   输出目录: {output_dir}")
        print("\n📁 转换后的文件：")
        
        if os.path.exists(output_dir):
            for filename in os.listdir(output_dir):
                if filename.endswith('.docx'):
                    print(f"   - {filename}")
    else:
        print("❌ 转换失败")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    main() 