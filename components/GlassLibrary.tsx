import React, { useState, useEffect } from 'react';
import { GlassType } from '../types';
import { getAllGlassTypes, saveGlassType, deleteGlassType } from '../services/glassService';
import { PlusIcon, TrashIcon, EditIcon } from './Icons';

const GlassLibrary: React.FC = () => {
  const [glasses, setGlasses] = useState<GlassType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentGlass, setCurrentGlass] = useState<GlassType | null>(null);
  const [formState, setFormState] = useState<{ name: string }>({ name: ''});

  useEffect(() => {
    loadGlasses();
  }, []);

  const loadGlasses = () => {
    setGlasses(getAllGlassTypes().sort((a,b) => a.name.localeCompare(b.name)));
  };

  const handleOpenModal = (glass?: GlassType) => {
    if (glass) {
      setCurrentGlass(glass);
      setFormState(glass);
    } else {
      setCurrentGlass(null);
      setFormState({ name: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentGlass(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name) {
        alert("Tên loại kính không được để trống.");
        return;
    }
    const glassToSave: GlassType = {
      id: currentGlass?.id || crypto.randomUUID(),
      ...formState,
    };
    saveGlassType(glassToSave);
    loadGlasses();
    handleCloseModal();
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa loại kính "${name}"?`)) {
      deleteGlassType(id);
      loadGlasses();
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Thư viện Loại kính</h1>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition"
          >
            <PlusIcon className="w-5 h-5" />
            Thêm Loại kính
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Loại kính</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {glasses.map(g => (
                <tr key={g.id}>
                  <td className="py-4 px-4 font-medium text-gray-900">{g.name}</td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                        <button onClick={() => handleOpenModal(g)} className="text-blue-600 hover:text-blue-900"><EditIcon className="w-5 h-5"/></button>
                        <button onClick={() => handleDelete(g.id, g.name)} className="text-red-600 hover:text-red-900"><TrashIcon className="w-5 h-5"/></button>
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
                <h2 className="text-2xl font-bold mb-6">{currentGlass ? 'Sửa thông tin Loại kính' : 'Thêm Loại kính mới'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Tên Loại kính *</label>
                        <input type="text" name="name" value={formState.name} onChange={handleInputChange} className="mt-1 p-2 w-full border rounded-md" required />
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

export default GlassLibrary;
