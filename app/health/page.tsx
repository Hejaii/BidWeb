'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'

export default function HealthPage() {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [frontendStatus, setFrontendStatus] = useState<'online'>('online')
  const [error, setError] = useState('')

  useEffect(() => {
    checkBackendHealth()
  }, [])

  const checkBackendHealth = async () => {
    try {
      const response = await axios.get('http://localhost:8000/', {
        timeout: 5000
      })
      if (response.data.message === '标书生成API服务运行中') {
        setBackendStatus('online')
      } else {
        setBackendStatus('offline')
      }
    } catch (err) {
      console.error('后端健康检查失败:', err)
      setBackendStatus('offline')
      setError('后端服务未运行或无法访问')
    }
  }

  const testUpload = async () => {
    try {
      const testData = {
        "项目名称": "测试项目",
        "需求描述": "这是一个测试需求"
      }
      
      const blob = new Blob([JSON.stringify(testData)], { type: 'application/json' })
      const file = new File([blob], 'test.json', { type: 'application/json' })
      
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await axios.post('http://localhost:8000/upload', formData, {
        timeout: 10000
      })
      
      if (response.data.success) {
        alert('上传测试成功！')
      } else {
        alert('上传测试失败')
      }
    } catch (err) {
      console.error('上传测试失败:', err)
      alert('上传测试失败，请检查后端服务')
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
    <div className="min-h-screen bg-gradient-secondary flex items-center justify-center p-4">
      <motion.div 
        className="max-w-2xl w-full"
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
              系统健康检查
            </h1>
            <p className="text-body text-gray-600">
              检查前后端服务状态和连接情况
            </p>
          </motion.div>

          <div className="space-y-6">
            {/* 前端状态 */}
            <motion.div 
              className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-200"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
            >
              <div>
                <h3 className="text-title text-gray-900">前端服务</h3>
                <p className="text-caption text-gray-600">Next.js 开发服务器</p>
              </div>
              <div className="flex items-center">
                <motion.div 
                  className="status-online"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-emerald-700 font-medium">在线</span>
              </div>
            </motion.div>

            {/* 后端状态 */}
            <motion.div 
              className="flex items-center justify-between p-4 rounded-xl border"
              style={{ 
                backgroundColor: backendStatus === 'online' ? 'rgb(var(--success-50))' : 'rgb(var(--error-50))',
                borderColor: backendStatus === 'online' ? 'rgb(var(--success-200))' : 'rgb(var(--error-200))'
              }}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
            >
              <div>
                <h3 className="text-title text-gray-900">后端服务</h3>
                <p className="text-caption text-gray-600">FastAPI 服务器 (端口 8000)</p>
              </div>
              <div className="flex items-center">
                <motion.div 
                  className={`status-dot ${
                    backendStatus === 'online' ? 'status-online' : 
                    backendStatus === 'checking' ? 'status-checking' : 'status-offline'
                  }`}
                  animate={backendStatus === 'checking' ? { scale: [1, 1.2, 1] } : {}}
                  transition={backendStatus === 'checking' ? { duration: 1, repeat: Infinity } : {}}
                />
                <span className={`font-medium ${
                  backendStatus === 'online' ? 'text-emerald-700' : 
                  backendStatus === 'checking' ? 'text-amber-700' : 'text-error-700'
                }`}>
                  {backendStatus === 'online' ? '在线' : 
                   backendStatus === 'checking' ? '检查中' : '离线'}
                </span>
              </div>
            </motion.div>

            {/* 错误信息 */}
            {error && (
              <motion.div 
                className="bg-error-50 border border-error-200 rounded-xl p-4"
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

            {/* 操作按钮 */}
            <motion.div 
              className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6 border-t border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <motion.button
                onClick={checkBackendHealth}
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                重新检查
              </motion.button>
              
              <motion.button
                onClick={testUpload}
                disabled={backendStatus !== 'online'}
                className="btn-success"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                测试上传
              </motion.button>
              
              <motion.button
                onClick={() => window.location.href = '/'}
                className="btn-secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                返回首页
              </motion.button>
            </motion.div>

            {/* 故障排除提示 */}
            {backendStatus === 'offline' && (
              <motion.div 
                className="bg-warning-50 border border-warning-200 rounded-xl p-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h4 className="text-title text-warning-800 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  故障排除
                </h4>
                <ul className="text-caption text-warning-700 space-y-1">
                  <li>• 确保后端服务已启动：<code className="bg-warning-100 px-1 rounded">cd backend && python3 main.py</code></li>
                  <li>• 检查端口8000是否被占用</li>
                  <li>• 确认Python依赖已安装：<code className="bg-warning-100 px-1 rounded">pip3 install -r requirements.txt</code></li>
                  <li>• 检查ProposalLLM模块路径是否正确</li>
                </ul>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
} 