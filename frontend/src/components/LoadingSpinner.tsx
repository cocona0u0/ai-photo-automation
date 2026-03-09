import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface LoadingSpinnerProps {
  tip?: string;
  size?: 'small' | 'default' | 'large';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  tip = '加载中...',
  size = 'large'
}) => {
  const antIcon = <LoadingOutlined style={{ 
    fontSize: size === 'large' ? 48 : 24,
    color: '#0a84ff',
  }} spin />;

  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '50px 0',
      width: '100%'
    }}>
      <Spin 
        indicator={antIcon} 
        tip={<span style={{ 
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: 14,
          fontWeight: 400,
        }}>{tip}</span>} 
        size={size} 
      />
    </div>
  );
};

export default LoadingSpinner;
