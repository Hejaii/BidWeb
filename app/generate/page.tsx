'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

interface ContentBlock {
  id: string
  title: string
  content: string
  isGenerating: boolean
  progress: number
  isCompleted: boolean
}

export default function GeneratePage() {
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([])
  const [isGeneratingAll, setIsGeneratingAll] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const savedOutline = sessionStorage.getItem('outline')
    if (savedOutline) {
      try {
        const outlineData = JSON.parse(savedOutline)
        const sortedEntries = Object.entries(outlineData).sort((a, b) => {
          const aParts = a[0].split('.').map(Number)
          const bParts = b[0].split('.').map(Number)
          
          for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
            const aPart = aParts[i] || 0
            const bPart = bParts[i] || 0
            if (aPart !== bPart) {
              return aPart - bPart
            }
          }
          return 0
        })
        
        const blocks = sortedEntries.map(([key, value]) => ({
          id: key,
          title: `${key}. ${value}`,
          content: '',
          isGenerating: false,
          progress: 0,
          isCompleted: false
        }))
        setContentBlocks(blocks)
      } catch (e) {
        setError('大纲数据格式错误')
      }
    } else {
      setError('未找到大纲数据，请重新上传文件')
    }
  }, [])

  const generateBlockContent = async (blockId: string) => {
    setContentBlocks(prev => prev.map(block => 
      block.id === blockId 
        ? { ...block, isGenerating: true, progress: 0 }
        : block
    ))

    try {
      const block = contentBlocks.find(b => b.id === blockId)
      if (!block) return

      const progressInterval = setInterval(() => {
        setContentBlocks(prev => prev.map(b => 
          b.id === blockId 
            ? { ...b, progress: Math.min(b.progress + Math.random() * 15, 85) }
            : b
        ))
      }, 300)

      const response = await axios.post('http://localhost:8000/generate-chapter', {
        chapter_id: blockId,
        chapter_title: block.title.replace(`${blockId}. `, '')
      }, {
        timeout: 60000,
      })

      clearInterval(progressInterval)

      if (response.data.success) {
        setContentBlocks(prev => prev.map(b => 
          b.id === blockId 
            ? { 
                ...b, 
                content: response.data.content, 
                isGenerating: false, 
                progress: 100, 
                isCompleted: true 
              }
            : b
        ))
      } else {
        throw new Error('生成失败')
      }
    } catch (err: any) {
      console.error('生成内容错误:', err)
      let errorMessage = '生成内容失败'
      if (err.code === 'ECONNABORTED') {
        errorMessage = '请求超时，请检查网络连接或稍后重试'
      } else if (err.response?.status === 0) {
        errorMessage = '无法连接到服务器，请确保后端服务正在运行'
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail
      }
      
      setError(errorMessage)
      setContentBlocks(prev => prev.map(b => 
        b.id === blockId 
          ? { ...b, isGenerating: false, progress: 0 }
          : b
      ))
    }
  }

  const generateAllContent = async () => {
    setIsGeneratingAll(true)
    setError('')

    for (const block of contentBlocks) {
      if (!block.isCompleted) {
        await generateBlockContent(block.id)
      }
    }

    setIsGeneratingAll(false)
  }

  const regenerateBlock = async (blockId: string) => {
    setContentBlocks(prev => prev.map(b => 
      b.id === blockId 
        ? { ...b, content: '', isCompleted: false }
        : b
    ))
    await generateBlockContent(blockId)
  }

  const updateBlockContent = async (blockId: string, newContent: string) => {
    try {
      const block = contentBlocks.find(b => b.id === blockId)
      if (!block) return

      const response = await axios.post('http://localhost:8000/update-chapter', {
        chapter_id: blockId,
        chapter_title: block.title.replace(`${blockId}. `, ''),
        content: newContent
      }, {
        timeout: 30000,
      })

      if (response.data.success) {
        setContentBlocks(prev => prev.map(b => 
          b.id === blockId 
            ? { ...b, content: newContent }
            : b
        ))
      } else {
        throw new Error('更新失败')
      }
    } catch (err: any) {
      console.error('更新内容错误:', err)
      let errorMessage = '更新内容失败'
      if (err.code === 'ECONNABORTED') {
        errorMessage = '请求超时，请检查网络连接或稍后重试'
      } else if (err.response?.status === 0) {
        errorMessage = '无法连接到服务器，请确保后端服务正在运行'
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail
      }
      
      setError(errorMessage)
    }
  }

  const handleViewFullText = () => {
    const fullContent = contentBlocks
      .filter(block => block.isCompleted)
      .map(block => `## ${block.title}\n\n${block.content}`)
      .join('\n\n')
    
    sessionStorage.setItem('fullContent', fullContent)
    router.push('/fulltext')
  }

  const completedBlocks = contentBlocks.filter(block => block.isCompleted).length
  const totalBlocks = contentBlocks.length

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut" as const
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-secondary p-4">
      <motion.div 
        className="max-w-6xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="card p-8">
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-headline text-gray-900 mb-4">
              生成标书内容
            </h1>
            <p className="text-body text-gray-600 mb-4">
              系统正在根据大纲生成标书内容，您可以查看每个章节的生成进度
            </p>
            {totalBlocks > 0 && (
              <motion.div 
                className="text-caption text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                已完成 {completedBlocks} / {totalBlocks} 个章节
              </motion.div>
            )}
          </motion.div>

          {error && (
            <motion.div 
              className="bg-error-50 border border-error-200 rounded-xl p-4 mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-caption text-error-700 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            </motion.div>
          )}

          <div className="space-y-6">
            {/* 内容块列表 */}
            <AnimatePresence>
              <motion.div 
                className="space-y-4"
                variants={containerVariants}
              >
                {contentBlocks.map((block, index) => (
                  <motion.div
                    key={block.id}
                    className="card-elevated p-6"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -2 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-title text-gray-900">
                        {block.title}
                      </h3>
                      <div className="flex space-x-2">
                        {block.isCompleted && (
                          <motion.button
                            onClick={() => regenerateBlock(block.id)}
                            disabled={block.isGenerating}
                            className="btn-warning text-sm px-3 py-1"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            重新生成
                          </motion.button>
                        )}
                        {!block.isCompleted && !block.isGenerating && (
                          <motion.button
                            onClick={() => generateBlockContent(block.id)}
                            disabled={isGeneratingAll}
                            className="btn-primary text-sm px-3 py-1"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            生成内容
                          </motion.button>
                        )}
                      </div>
                    </div>

                    {/* 进度条 */}
                    {block.isGenerating && (
                      <motion.div 
                        className="mb-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex justify-between text-caption text-gray-600 mb-2">
                          <span>生成中...</span>
                          <span>{Math.round(block.progress)}%</span>
                        </div>
                        <div className="progress">
                          <motion.div
                            className="progress-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${block.progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* 生成的内容 */}
                    {block.isCompleted && (
                      <motion.div 
                        className="bg-gray-50 rounded-xl p-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="mb-2 flex justify-between items-center">
                          <span className="text-caption text-gray-600">编辑内容（自动保存）</span>
                          <span className="text-xs text-emerald-600 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            已保存
                          </span>
                        </div>
                        <textarea
                          value={block.content}
                          onChange={(e) => {
                            const newContent = e.target.value
                            setContentBlocks(prev => prev.map(b => 
                              b.id === block.id 
                                ? { ...b, content: newContent }
                                : b
                            ))
                            setTimeout(() => {
                              updateBlockContent(block.id, newContent)
                            }, 1000)
                          }}
                          className="textarea h-32"
                          placeholder="生成的内容..."
                        />
                      </motion.div>
                    )}

                    {/* 状态指示 */}
                    {!block.isGenerating && !block.isCompleted && (
                      <div className="text-caption text-gray-500">
                        点击"生成内容"开始生成此章节
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* 操作按钮 */}
            <motion.div 
              className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6 border-t border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <motion.button
                onClick={() => router.push('/outline')}
                className="btn-secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isGeneratingAll}
              >
                返回大纲
              </motion.button>
              
              <motion.button
                onClick={generateAllContent}
                disabled={isGeneratingAll || contentBlocks.length === 0}
                className="btn-success"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isGeneratingAll ? '生成中...' : '生成全部内容'}
              </motion.button>
              
              <motion.button
                onClick={handleViewFullText}
                disabled={completedBlocks === 0 || completedBlocks < totalBlocks}
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                查看全文
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 