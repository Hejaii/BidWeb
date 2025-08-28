'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function HomePage() {
  const router = useRouter()

  const handleStartExperience = () => {
    router.push('/upload')
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const
      }
    }
  }

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: "智能分析",
      description: "自动解析招标文件，提取关键需求信息，确保标书内容精准匹配",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "快速生成",
      description: "基于AI技术，快速生成专业标书内容，大幅提升工作效率",
      gradient: "from-emerald-500 to-green-600"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: "专业输出",
      description: "支持多种格式输出，满足不同需求，确保标书质量达到专业标准",
      gradient: "from-purple-500 to-pink-600"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-blue-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <motion.div 
        className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto text-center">
          {/* 主标题区域 */}
          <motion.div className="mb-20" variants={itemVariants}>
            <motion.h1 
              className="text-display text-gray-900 mb-8 text-balance"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              智能标书生成系统
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-600 leading-relaxed max-w-4xl mx-auto text-balance"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              基于先进的人工智能技术，为您提供专业、高效的标书生成服务。
              上传招标文件，智能分析需求，自动生成符合标准的标书内容，
              让您的投标工作更加轻松高效。
            </motion.p>
          </motion.div>

          {/* 功能特性卡片 */}
          <motion.div 
            className="grid md:grid-cols-3 gap-8 mb-20"
            variants={containerVariants}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="card-elevated p-8 group"
                variants={itemVariants}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
                }}
              >
                <motion.div 
                  className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg`}
                  whileHover={{ 
                    scale: 1.1,
                    transition: { duration: 0.3 }
                  }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-title text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-body text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* 行动按钮 */}
          <motion.div 
            className="flex flex-col sm:flex-row justify-center items-center gap-4"
            variants={itemVariants}
          >
            <motion.button
              onClick={handleStartExperience}
              className="btn-primary text-lg font-semibold px-8 py-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              立即体验
            </motion.button>
            <motion.button
              onClick={() => router.push('/health')}
              className="btn-ghost text-lg font-medium px-8 py-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              系统状态
            </motion.button>
          </motion.div>

          {/* 底部信息 */}
          <motion.div 
            className="mt-16 text-center"
            variants={itemVariants}
          >
            <p className="text-caption text-gray-500">
              基于 Next.js + FastAPI + OpenAI 构建
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
} 