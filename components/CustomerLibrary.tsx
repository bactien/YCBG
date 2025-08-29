
import React, { useState, useEffect } from 'react';
import { Customer } from '../types';
import { getAllCustomers, saveCustomer, deleteCustomer, generateCustomerCode } from '../services/customerService';
import { PlusIcon, TrashIcon, EditIcon } from './Icons';

const CustomerLibrary: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [formState, setFormState] = useState<Omit<Customer, 'id'>>({ code: '', name: '', address: ''});

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    setCustomers(getAllCustomers().sort((a,b) => b.code.localeCompare(a.code)));
  };

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setCurrentCustomer(customer);
      setFormState(customer);
    } else {
      setCurrentCustomer(null);
      setFormState({ code: generateCustomerCode(), name: '', address: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCustomer(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name) {
        alert("Tên khách hàng không được để trống.");
        return;
    }
    const customerToSave: Customer = {
      id: currentCustomer?.id || crypto.randomUUID(),
      ...formState,
    };
    saveCustomer(customerToSave);
    loadCustomers();
    handleCloseModal();
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa khách hàng "${name}"?`)) {
      deleteCustomer(id);
      loadCustomers();
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Thư viện Khách hàng</h1>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition"
          >
            <PlusIcon className="w-5 h-5" />
            Thêm Khách Hàng
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã KH</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Khách Hàng</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Địa chỉ</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.map(c => (
                <tr key={c.id}>
                  <td className="py-4 px-4 whitespace-nowrap font-medium text-gray-900">{c.code}</td>
                  <td className="py-4 px-4 text-gray-700">{c.name}</td>
                  <td className="py-4 px-4 text-gray-700">{c.address}</td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                        <button onClick={() => handleOpenModal(c)} className="text-blue-600 hover:text-blue-900"><EditIcon className="w-5 h-5"/></button>
                        <button onClick={() => handleDelete(c.id, c.name)} className="text-red-600 hover:text-red-900"><TrashIcon className="w-5 h-5"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6">{currentCustomer ? 'Sửa thông tin Khách hàng' : 'Thêm Khách hàng mới'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mã KH</label>
                        <input type="text" name="code" value={formState.code} readOnly className="mt-1 p-2 w-full border rounded-md bg-gray-100" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Tên Khách hàng *</label>
                        <input type="text" name="name" value={formState.name} onChange={handleInputChange} className="mt-1 p-2 w-full border rounded-md" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                        <input type="text" name="address" value={formState.address} onChange={handleInputChange} className="mt-1 p-2 w-full border rounded-md" />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={handleCloseModal} className="py-2 px-4 bg-gray-200 rounded-lg hover:bg-gray-300">Hủy</button>
                        <button type="submit" className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default CustomerLibrary;
