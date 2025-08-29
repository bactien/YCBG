import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuotationRequest, Status, RequesterType } from '../types';
import { getAllQuotations, deleteQuotation } from '../services/quotationService';
import { EditIcon, TrashIcon, PlusIcon, ArrowDownTrayIcon } from './Icons';

const QuotationList: React.FC = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<QuotationRequest[]>([]);
  const [filters, setFilters] = useState({ code: '', customerName: '', date: '', requesterType: '' });

  useEffect(() => {
    setQuotations(getAllQuotations());
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = (id: string, code: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa phiếu ${code} không?`)) {
      deleteQuotation(id);
      setQuotations(getAllQuotations());
    }
  };
  
  const filteredQuotations = useMemo(() => {
    return quotations
      .filter(q => q.code.toLowerCase().includes(filters.code.toLowerCase()))
      .filter(q => q.customerName.toLowerCase().includes(filters.customerName.toLowerCase()))
      .filter(q => !filters.date || q.date === filters.date)
      .filter(q => !filters.requesterType || q.requesterType === filters.requesterType)
      .sort((a, b) => b.code.localeCompare(a.code)); // Sort by code descending
  }, [quotations, filters]);

  const handleExportCSV = () => {
    if (filteredQuotations.length === 0) {
      alert("Không có dữ liệu để xuất.");
      return;
    }

    const headers = [
      "Số Phiếu", "Ngày Lập", "Tên Khách Hàng", "Mã số KH", "Địa chỉ KH",
      "Trạng Thái", "Hệ", "Màu", "Kính", "Sơn", "Vận Chuyển", "Chiết khấu (%)", "Số Lượng Hạng Mục"
    ];

    const escapeCSV = (value: any): string => {
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const csvContent = [
      headers.join(','),
      ...filteredQuotations.map(q => [
        escapeCSV(q.code),
        escapeCSV(new Date(q.date).toLocaleDateString('vi-VN')),
        escapeCSV(q.customerName),
        escapeCSV(q.customerCode),
        escapeCSV(q.customerAddress),
        escapeCSV(q.status),
        escapeCSV(q.system),
        escapeCSV(q.color),
        escapeCSV(q.glass),
        escapeCSV(q.paint),
        escapeCSV(q.shipping),
        escapeCSV(q.discountPercentage || 0),
        escapeCSV(q.items.length)
      ].join(','))
    ].join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const date = new Date().toISOString().slice(0,10);
    link.setAttribute('download', `YCBG_Export_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Danh sách Phiếu Yêu Cầu Báo Giá</h1>
          <div className="flex items-center gap-2">
            <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300"
              >
              <ArrowDownTrayIcon className="w-5 h-5" />
              Xuất CSV
            </button>
            <button
              onClick={() => navigate('/new')}
              className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              <PlusIcon className="w-5 h-5" />
              Tạo phiếu mới
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 border border-gray-200 rounded-lg">
          <input
            type="text"
            name="code"
            placeholder="Lọc theo số phiếu..."
            value={filters.code}
            onChange={handleFilterChange}
            className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            name="customerName"
            placeholder="Lọc theo tên KH..."
            value={filters.customerName}
            onChange={handleFilterChange}
            className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="date"
            name="date"
            value={filters.date}
            onChange={handleFilterChange}
            className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            name="requesterType"
            value={filters.requesterType}
            onChange={handleFilterChange}
            className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả người yêu cầu</option>
            <option value={RequesterType.NVKD}>{RequesterType.NVKD}</option>
            <option value={RequesterType.Other}>{RequesterType.Other}</option>
          </select>
        </div>

        {/* Quotations Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số Phiếu</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Khách Hàng</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày Lập</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredQuotations.length > 0 ? (
                filteredQuotations.map(q => (
                  <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 whitespace-nowrap font-medium text-gray-900">{q.code}</td>
                    <td className="py-4 px-4 whitespace-nowrap text-gray-700">{q.customerName}</td>
                    <td className="py-4 px-4 whitespace-nowrap text-gray-700">{new Date(q.date).toLocaleDateString('vi-VN')}</td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        q.status === Status.Final ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-4">
                        <button onClick={() => navigate(`/edit/${q.id}`)} className="text-blue-600 hover:text-blue-900 transition" title="Sửa">
                           <EditIcon className="w-5 h-5"/>
                        </button>
                        <button onClick={() => handleDelete(q.id, q.code)} className="text-red-600 hover:text-red-900 transition" title="Xóa">
                           <TrashIcon className="w-5 h-5"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-500">Không tìm thấy phiếu yêu cầu nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuotationList;