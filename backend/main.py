from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel
import json
import os
import sys
import tempfile
from pathlib import Path
from docx import Document

# 添加ProposalLLM模块路径
proposal_llm_path = Path(__file__).parent.parent / "ProposalLLM-main"
sys.path.append(str(proposal_llm_path))

# 设置工作目录为ProposalLLM目录
os.chdir(proposal_llm_path)

try:
    from Generate import call_qwen_api, generate_toc_structure, generate_chapter_content
    print("成功导入ProposalLLM模块")
    print(f"generate_chapter_content函数: {generate_chapter_content}")
    # 确保使用真实的ProposalLLM函数
    real_generate_chapter_content = generate_chapter_content
    # 测试函数是否返回内容而不是文件名
    test_result = real_generate_chapter_content("test", "测试", "test")
    print(f"测试函数返回类型: {type(test_result)}, 长度: {len(str(test_result))}")
except ImportError as e:
    print(f"导入ProposalLLM模块失败: {e}")
    # 创建模拟函数用于测试
    def call_qwen_api(prompt):
        return {"output": {"text": "模拟API响应"}}
    
    def generate_toc_structure():
        return {
            "1": "项目概述",
            "2": "技术方案", 
            "2.1": "系统架构设计",
            "2.2": "功能模块设计",
            "2.3": "技术实现方案",
            "2.4": "系统集成方案",
            "3": "项目实施",
            "3.1": "实施计划",
            "3.2": "质量保证",
            "3.3": "风险控制",
            "4": "技术支持",
            "4.1": "技术团队",
            "4.2": "服务承诺",
            "5": "附录"
        }
    
    def real_generate_chapter_content(chapter_id, chapter_title, requirements):
        print(f"使用模拟函数生成章节: {chapter_id} - {chapter_title}")
        return f"这是{chapter_title}的生成内容。\n\n这里包含了该章节的详细内容，包括技术方案、实施计划、质量保证等各个方面。内容会根据招标文件的要求进行定制化生成，确保符合招标方的需求。\n\n该章节涵盖了项目概述、技术架构、功能模块、实施计划等关键信息，为投标方提供完整的技术方案。"

app = FastAPI(title="标书生成API", version="1.0.0")

# 配置CORS - 修复编码和端口问题
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "标书生成API服务运行中"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """上传JSON文件并生成大纲"""
    try:
        if not file.filename.endswith('.json'):
            raise HTTPException(status_code=400, detail="只支持JSON文件")
        
        # 读取文件内容
        content = await file.read()
        json_data = json.loads(content.decode('utf-8'))
        
        # 保存上传的文件到ProposalLLM目录，供其使用
        temp_file = proposal_llm_path / "招标文件示例.json"
        with open(temp_file, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, ensure_ascii=False, indent=2)
        
        # 调用ProposalLLM生成大纲
        outline = generate_toc_structure()
        
        return {
            "success": True,
            "outline": outline,
            "message": "文件上传成功，大纲已生成"
        }
    except Exception as e:
        print(f"处理文件时出错: {str(e)}")
        raise HTTPException(status_code=500, detail=f"处理文件时出错: {str(e)}")

@app.post("/regenerate-outline")
async def regenerate_outline():
    """重新生成大纲"""
    try:
        outline = generate_toc_structure()
        return {
            "success": True,
            "outline": outline,
            "message": "大纲重新生成成功"
        }
    except Exception as e:
        print(f"重新生成大纲时出错: {str(e)}")
        raise HTTPException(status_code=500, detail=f"重新生成大纲时出错: {str(e)}")

# 请求模型
class DownloadRequest(BaseModel):
    content: str
    type: str

class GenerateChapterRequest(BaseModel):
    chapter_id: str
    chapter_title: str

@app.post("/generate-chapter")
async def generate_chapter_api(request: GenerateChapterRequest):
    """生成单个章节内容"""
    try:
        print(f"收到章节生成请求: {request.chapter_id} - {request.chapter_title}")
        
        # 获取招标文件内容作为需求
        requirements_text = ""
        tender_file = proposal_llm_path / "招标文件示例.json"
        if tender_file.exists():
            with open(tender_file, 'r', encoding='utf-8') as f:
                tender_data = json.load(f)
                # 提取需求内容
                if isinstance(tender_data, dict):
                    requirements = []
                    for key, value in tender_data.items():
                        if isinstance(value, str):
                            requirements.append(value)
                        elif isinstance(value, dict):
                            requirements.extend([str(v) for v in value.values() if isinstance(v, str)])
                    requirements_text = "\n".join(requirements)
        
        # 调用真实的章节生成函数
        content = real_generate_chapter_content(request.chapter_id, request.chapter_title, requirements_text)
        
        return {
            "success": True,
            "content": content,
            "message": f"章节 {request.chapter_id} 生成成功"
        }
    except Exception as e:
        print(f"生成章节时出错: {str(e)}")
        raise HTTPException(status_code=500, detail=f"生成章节时出错: {str(e)}")

# 新增：更新章节内容API
class UpdateChapterRequest(BaseModel):
    chapter_id: str
    chapter_title: str
    content: str

@app.post("/update-chapter")
async def update_chapter_api(request: UpdateChapterRequest):
    """更新章节内容"""
    try:
        # 保存更新后的章节内容到文件
        filename = f"generated_proposal/章节_{request.chapter_id}_{request.chapter_title}.txt"
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(f"{request.chapter_id}. {request.chapter_title}\n\n{request.content}")
        
        return {
            "success": True,
            "message": f"章节 {request.chapter_id} 更新成功"
        }
    except Exception as e:
        print(f"更新章节时出错: {str(e)}")
        raise HTTPException(status_code=500, detail=f"更新章节时出错: {str(e)}")

@app.get("/get-chapter-content")
async def get_chapter_content(chapter_id: str, chapter_title: str):
    """获取章节内容"""
    try:
        filename = f"generated_proposal/章节_{chapter_id}_{chapter_title}.txt"
        if os.path.exists(filename):
            with open(filename, 'r', encoding='utf-8') as f:
                content = f.read()
            return {
                "success": True,
                "content": content
            }
        else:
            return {
                "success": False,
                "content": "",
                "message": "章节文件不存在"
            }
    except Exception as e:
        print(f"获取章节内容时出错: {str(e)}")
        raise HTTPException(status_code=500, detail=f"获取章节内容时出错: {str(e)}")

@app.post("/download")
async def download_file(request: DownloadRequest):
    """下载生成的文件"""
    try:
        if request.type == "txt":
            # 返回txt文件
            return Response(
                content=request.content,
                media_type="text/plain",
                headers={"Content-Disposition": "attachment; filename=标书.txt"}
            )
        elif request.type == "html":
            # 返回html文件
            return Response(
                content=request.content,
                media_type="text/html",
                headers={"Content-Disposition": "attachment; filename=标书.html"}
            )
        else:
            raise HTTPException(status_code=400, detail="不支持的文件类型")
    except Exception as e:
        print(f"下载文件时出错: {str(e)}")
        raise HTTPException(status_code=500, detail=f"下载文件时出错: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 