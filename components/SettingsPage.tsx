import React, { useState, useEffect } from 'react';
import { getCompanyLogo, saveCompanyLogo, removeCompanyLogo } from '../services/settingsService';
import { TrashIcon } from './Icons';

const SettingsPage: React.FC = () => {
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    setLogo(getCompanyLogo());
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert("Kích thước file quá lớn. Vui lòng chọn ảnh nhỏ hơn 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        saveCompanyLogo(result);
        setLogo(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa logo không?")) {
        removeCompanyLogo();
        setLogo(null);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Cài đặt</h1>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Logo Công ty</h2>
            <p className="text-sm text-gray-500 mb-4">Logo này sẽ hiển thị trên các phiếu báo giá khi in. Đề nghị sử dụng ảnh có nền trong suốt (PNG) để có kết quả tốt nhất.</p>
            
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 border-2 border-dashed rounded-md flex items-center justify-center bg-gray-50">
                {logo ? (
                  <img src={logo} alt="Company Logo" className="max-w-full max-h-full object-contain" />
                ) : (
                  <span className="text-sm text-gray-400">Chưa có logo</span>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <label className="cursor-pointer bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition text-center">
                  Tải lên Logo
                  <input type="file" accept="image/png, image/jpeg, image/svg+xml" className="hidden" onChange={handleLogoUpload} />
                </label>
                {logo && (
                  <button onClick={handleRemoveLogo} className="flex items-center justify-center gap-2 bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition">
                    <TrashIcon className="w-5 h-5"/> Xóa Logo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Future settings can be added here */}

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;