'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { motion } from 'framer-motion'

export default function OutlinePage() {
  const [outline, setOutline] = useState<string>('')
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const savedOutline = sessionStorage.getItem('outline')
    if (savedOutline) {
      try {
        const outlineData = JSON.parse(savedOutline)
        const outlineText = formatOutlineToText(outlineData)
        setOutline(outlineText)
      } catch (e) {
        setError('大纲数据格式错误')
      }
    } else {
      setError('未找到大纲数据，请重新上传文件')
    }
  }, [])

  const formatOutlineToText = (outlineData: any) => {
    let text = ''
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
    
    for (const [key, value] of sortedEntries) {
      const indent = key.split('.').length - 1
      const indentStr = '  '.repeat(indent)
      text += `${indentStr}${key}. ${value}\n`
    }
    return text.trim()
  }

  const formatTextToOutline = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim())
    const outline: any = {}
    
    lines.forEach(line => {
      const match = line.match(/^(\s*)(\d+(?:\.\d+)*)\.\s*(.+)$/)
      if (match) {
        const [, indent, key, value] = match
        outline[key] = value.trim()
      }
    })
    
    return outline
  }

  const handleRegenerateOutline = async () => {
    setIsRegenerating(true)
    setError('')

    try {
      const response = await axios.post('http://localhost:8000/regenerate-outline', {}, {
        timeout: 30000,
      })
      
      if (response.data.success) {
        const newOutlineText = formatOutlineToText(response.data.outline)
        setOutline(newOutlineText)
        sessionStorage.setItem('outline', JSON.stringify(response.data.outline))
      }
    } catch (err: any) {
      console.error('重新生成大纲错误:', err)
      if (err.code === 'ECONNABORTED') {
        setError('请求超时，请检查网络连接或稍后重试')
      } else if (err.response?.status === 0) {
        setError('无法连接到服务器，请确保后端服务正在运行')
      } else {
        setError(err.response?.data?.detail || '重新生成大纲失败')
      }
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleGenerateFullText = () => {
    const currentOutline = formatTextToOutline(outline)
    sessionStorage.setItem('outline', JSON.stringify(currentOutline))
    router.push('/generate')
  }

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
              标书大纲
            </h1>
            <p className="text-body text-gray-600">
              您可以编辑大纲内容，或重新生成大纲，然后生成完整的标书内容
            </p>
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
            {/* 大纲编辑区域 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <label htmlFor="outline" className="block text-caption font-medium text-gray-700 mb-2">
                标书大纲（可编辑）
              </label>
              <textarea
                id="outline"
                value={outline}
                onChange={(e) => setOutline(e.target.value)}
                className="textarea h-96 font-mono text-sm"
                placeholder="大纲内容..."
                disabled={isRegenerating}
              />
            </motion.div>

            {/* 操作按钮 */}
            <motion.div 
              className="flex flex-col sm:flex-row justify-center items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.button
                onClick={() => router.push('/upload')}
                className="btn-secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isRegenerating || isGenerating}
              >
                返回上传
              </motion.button>
              
              <motion.button
                onClick={handleRegenerateOutline}
                disabled={isRegenerating || isGenerating}
                className="btn-warning"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isRegenerating ? '重新生成中...' : '重新生成大纲'}
              </motion.button>
              
              <motion.button
                onClick={handleGenerateFullText}
                disabled={isRegenerating || isGenerating || !outline.trim()}
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isGenerating ? '生成中...' : '生成全文'}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 