'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { motion } from 'framer-motion'

export default function FullTextPage() {
  const [fullContent, setFullContent] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadType, setDownloadType] = useState<'txt' | 'docx' | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const savedContent = sessionStorage.getItem('fullContent')
    if (savedContent) {
      setFullContent(savedContent)
    } else {
      loadContentFromFiles()
    }
  }, [])

  const loadContentFromFiles = async () => {
    try {
      const savedOutline = sessionStorage.getItem('outline')
      if (!savedOutline) {
        setError('未找到大纲数据，请重新生成')
        return
      }

      const outlineData = JSON.parse(savedOutline)
      let fullContent = ''

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

      for (const [chapterId, chapterTitle] of sortedEntries) {
        try {
          const response = await axios.get(`http://localhost:8000/get-chapter-content`, {
            params: {
              chapter_id: chapterId,
              chapter_title: chapterTitle
            },
            timeout: 10000
          })
          
          if (response.data.success) {
            const level = chapterId.split('.').length
            if (level === 1) {
              fullContent += `${chapterId}. ${chapterTitle}\n\n${response.data.content}\n\n`
            } else if (level === 2) {
              fullContent += `  ${chapterId}. ${chapterTitle}\n\n${response.data.content}\n\n`
            } else {
              fullContent += `    ${chapterId}. ${chapterTitle}\n\n${response.data.content}\n\n`
            }
          }
        } catch (err) {
          console.error(`读取章节 ${chapterId} 内容失败:`, err)
          const level = chapterId.split('.').length
          if (level === 1) {
            fullContent += `${chapterId}. ${chapterTitle}\n\n[内容读取失败，请重新生成此章节]\n\n`
          } else if (level === 2) {
            fullContent += `  ${chapterId}. ${chapterTitle}\n\n[内容读取失败，请重新生成此章节]\n\n`
          } else {
            fullContent += `    ${chapterId}. ${chapterTitle}\n\n[内容读取失败，请重新生成此章节]\n\n`
          }
        }
      }

      if (fullContent.trim()) {
        setFullContent(fullContent)
        sessionStorage.setItem('fullContent', fullContent)
      } else {
        setError('无法读取标书内容，请重新生成')
      }
    } catch (err) {
      console.error('加载内容失败:', err)
      setError('加载标书内容失败，请重新生成')
    }
  }

  const handleDownload = async (type: 'txt' | 'docx') => {
    setIsDownloading(true)
    setDownloadType(type)
    setError('')

    try {
      const response = await axios.post('http://localhost:8000/download', {
        content: fullContent,
        type: type
      }, {
        responseType: 'blob',
        timeout: 30000,
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `标书内容.${type}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      console.error('下载错误:', err)
      if (err.code === 'ECONNABORTED') {
        setError('下载超时，请检查网络连接或稍后重试')
      } else if (err.response?.status === 0) {
        setError('无法连接到服务器，请确保后端服务正在运行')
      } else {
        setError('下载失败，请重试')
      }
    } finally {
      setIsDownloading(false)
      setDownloadType(null)
    }
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
              标书全文
            </h1>
            <p className="text-body text-gray-600">
              以下是生成的完整标书内容，您可以查看、编辑或下载
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
            {/* 内容编辑区域 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <label htmlFor="fullContent" className="block text-caption font-medium text-gray-700 mb-2">
                标书内容（可编辑）
              </label>
              <textarea
                id="fullContent"
                value={fullContent}
                onChange={(e) => setFullContent(e.target.value)}
                className="textarea h-96 font-mono text-sm"
                placeholder="标书内容..."
              />
            </motion.div>

            {/* 操作按钮 */}
            <motion.div 
              className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6 border-t border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.button
                onClick={() => router.push('/generate')}
                className="btn-secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isDownloading}
              >
                返回生成
              </motion.button>
              
              <motion.button
                onClick={() => handleDownload('txt')}
                disabled={isDownloading || !fullContent.trim()}
                className="btn-success"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isDownloading && downloadType === 'txt' ? '下载中...' : '下载TXT文件'}
              </motion.button>
              
              <motion.button
                onClick={() => handleDownload('docx')}
                disabled={isDownloading || !fullContent.trim()}
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isDownloading && downloadType === 'docx' ? '下载中...' : '下载DOCX文件'}
              </motion.button>
            </motion.div>

            {/* 内容统计 */}
            {fullContent && (
              <motion.div 
                className="text-center text-caption text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                文档长度：{fullContent.length} 字符
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
} 