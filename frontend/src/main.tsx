import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider 
      locale={zhCN}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#0a84ff',
          colorBgBase: '#000000',
          colorBgContainer: 'rgba(28, 28, 30, 0.85)',
          borderRadius: 12,
          colorBorder: 'rgba(84, 84, 88, 0.6)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        components: {
          Card: {
            colorBgContainer: 'rgba(28, 28, 30, 0.7)',
            colorBorderSecondary: 'rgba(84, 84, 88, 0.4)',
          },
          Upload: {
            colorBgContainer: 'rgba(44, 44, 46, 0.5)',
            colorBorder: 'rgba(84, 84, 88, 0.4)',
          },
        },
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>,
)
