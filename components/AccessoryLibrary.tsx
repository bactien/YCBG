import React, { useState, useEffect } from 'react';
import { AccessorySet } from '../types';
import { getAllAccessorySets, saveAccessorySet, deleteAccessorySet } from '../services/accessoryService';
import { PlusIcon, TrashIcon, EditIcon } from './Icons';

const AccessoryLibrary: React.FC = () => {
  const [accessories, setAccessories] = useState<AccessorySet[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAccessory, setCurrentAccessory] = useState<AccessorySet | null>(null);
  const [formState, setFormState] = useState<{ name: string; description: string }>({ name: '', description: ''});

  useEffect(() => {
    loadAccessories();
  }, []);

  const loadAccessories = () => {
    setAccessories(getAllAccessorySets().sort((a,b) => a.name.localeCompare(b.name)));
  };

  const handleOpenModal = (accessory?: AccessorySet) => {
    if (accessory) {
      setCurrentAccessory(accessory);
      setFormState(accessory);
    } else {
      setCurrentAccessory(null);
      setFormState({ name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentAccessory(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name) {
        alert("Tên bộ phụ kiện không được để trống.");
        return;
    }
    const accessoryToSave: AccessorySet = {
      id: currentAccessory?.id || crypto.randomUUID(),
      ...formState,
    };
    saveAccessorySet(accessoryToSave);
    loadAccessories();
    handleCloseModal();
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bộ phụ kiện "${name}"?`)) {
      deleteAccessorySet(id);
      loadAccessories();
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Thư viện Phụ kiện</h1>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition"
          >
            <PlusIcon className="w-5 h-5" />
            Thêm Phụ kiện
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Bộ Phụ kiện</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {accessories.map(a => (
                <tr key={a.id}>
                  <td className="py-4 px-4 font-medium text-gray-900">{a.name}</td>
                   <td className="py-4 px-4 text-gray-700">{a.description}</td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                        <button onClick={() => handleOpenModal(a)} className="text-blue-600 hover:text-blue-900"><EditIcon className="w-5 h-5"/></button>
                        <button onClick={() => handleDelete(a.id, a.name)} className="text-red-600 hover:text-red-900"><TrashIcon className="w-5 h-5"/></button>
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
                <h2 className="text-2xl font-bold mb-6">{currentAccessory ? 'Sửa thông tin Phụ kiện' : 'Thêm Phụ kiện mới'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Tên Bộ Phụ kiện *</label>
                        <input type="text" name="name" value={formState.name} onChange={handleInputChange} className="mt-1 p-2 w-full border rounded-md" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                        <textarea name="description" value={formState.description} onChange={handleInputChange} className="mt-1 p-2 w-full border rounded-md" rows={3}></textarea>
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

export default AccessoryLibrary;
