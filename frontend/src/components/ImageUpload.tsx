import React, { useState } from 'react';
import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps, UploadFile } from 'antd';

const { Dragger } = Upload;

interface ImageUploadProps {
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
  accept?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onFileChange, 
  disabled = false,
  accept = 'image/jpeg,image/png,image/gif,image/webp'
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const props: UploadProps = {
    name: 'file',
    multiple: false,
    maxCount: 1,
    accept,
    fileList,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件!');
        return Upload.LIST_IGNORE;
      }

      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('图片大小不能超过5MB!');
        return Upload.LIST_IGNORE;
      }

      setFileList([file as any]);
      // 确保传出去的是原始的 File 对象（RcFile 继承自 File，直接可用）
      onFileChange(file as unknown as File);
      return false; // 阻止 Ant Design 自动上传
    },
    onRemove: () => {
      setFileList([]);
      onFileChange(null);
    },
    disabled
  };

  return (
    <Dragger {...props}>
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">点击或拖拽图片到此区域上传</p>
      <p className="ant-upload-hint">
        支持jpg、png、gif、webp格式,文件大小不超过5MB
      </p>
    </Dragger>
  );
};

export default ImageUpload;
