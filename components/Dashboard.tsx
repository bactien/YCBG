import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuotationRequest, Status } from '../types';
import { getAllQuotations } from '../services/quotationService';
import { ChartPieIcon, DocumentTextIcon, DocumentCheckIcon } from './Icons';
import PieChart from './PieChart';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color }) => (
  <div className={`bg-white p-6 rounded-lg shadow-lg border-l-4 ${color}`}>
    <div className="flex items-center">
      <div className="p-3 rounded-full bg-gray-100 mr-4">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  </div>
);


const Dashboard: React.FC = () => {
  const [quotations, setQuotations] = useState<QuotationRequest[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setQuotations(getAllQuotations());
  }, []);

  const stats = useMemo(() => {
    const totalCount = quotations.length;
    const draftCount = quotations.filter(q => q.status === Status.Draft).length;
    const finalCount = quotations.filter(q => q.status === Status.Final).length;
    return { totalCount, draftCount, finalCount };
  }, [quotations]);
  
  const pieChartData = [
    { label: 'Nháp', value: stats.draftCount, color: '#f59e0b' }, // amber-500
    { label: 'Hoàn tất', value: stats.finalCount, color: '#10b981' }, // emerald-500
  ];

  return (
    <div className="container mx-auto p-4 md:p-8">
       <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600">Tổng quan về các phiếu yêu cầu báo giá.</p>
       </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard 
            icon={<DocumentTextIcon className="w-8 h-8 text-blue-500"/>} 
            title="Tổng số Phiếu"
            value={stats.totalCount}
            color="border-blue-500"
        />
        <StatCard 
            icon={<ChartPieIcon className="w-8 h-8 text-amber-500"/>} 
            title="Phiếu Nháp"
            value={stats.draftCount}
            color="border-amber-500"
        />
        <StatCard 
            icon={<DocumentCheckIcon className="w-8 h-8 text-emerald-500"/>} 
            title="Phiếu Hoàn Tất"
            value={stats.finalCount}
            color="border-emerald-500"
        />
      </div>

      {/* Charts */}
       <div className="grid grid-cols-1 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
             <h2 className="text-xl font-semibold text-gray-700 mb-4">Phân loại Trạng thái</h2>
             <div className="flex justify-center">
                <PieChart data={pieChartData} size={250} />
             </div>
          </div>
       </div>

    </div>
  );
};

export default Dashboard;