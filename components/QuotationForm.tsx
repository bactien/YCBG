import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import printModule from 'react-to-print';
import { GoogleGenAI, Type } from "@google/genai";
import { QuotationRequest, Item, RequesterType, DoorType, OpenDirection, Status, Customer, AluminumSystem, GlassType, AccessorySet } from '../types';
import { getQuotationById, saveQuotation, generateRequestCode } from '../services/quotationService';
import { getAllCustomers } from '../services/customerService';
import { getAllAluminumSystems } from '../services/aluminumService';
import { getAllGlassTypes } from '../services/glassService';
import { getAllAccessorySets } from '../services/accessoryService';
import { PlusIcon, TrashIcon, CloneIcon, PrintIcon, ShareIcon, PaintBrushIcon, MagicIcon } from './Icons';
import QuotationPrintView from './QuotationPrintView';
import DrawingModal from './DrawingModal';

const useReactToPrint = (printModule as any).useReactToPrint;

const newEmptyItem = (): Item => ({
  id: crypto.randomUUID(),
  doorName: '',
  system: '',
  glass: '',
  quantity: 1,
  doorType: null,
  openDir: null,
  imageUrl: '',
  accessories: '',
});

const newEmptyQuotation = (): QuotationRequest => ({
  id: crypto.randomUUID(),
  code: generateRequestCode(),
  date: new Date().toISOString().split('T')[0],
  requesterType: RequesterType.NVKD,
  system: '',
  color: '',
  glass: '',
  paint: '',
  shipping: '',
  customerCode: '',
  customerName: '',
  customerAddress: '',
  status: Status.Draft,
  items: [newEmptyItem()],
  discountPercentage: 0,
});

// FIX: Corrected the type of the onChange event handler to only accept HTMLInputElement events.
const AutocompleteInput = ({ value, onChange, onSelect, suggestions, placeholder, name }: { value: string, name?: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, onSelect: (value: string) => void, suggestions: {name: string}[], placeholder?: string }) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const filteredSuggestions = value ? suggestions.filter(s => s.name.toLowerCase().includes(value.toLowerCase())) : [];

    return (
        <div className="relative w-full">
            <input
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="p-2 border rounded-md w-full"
                placeholder={placeholder}
                autoComplete="off"
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-auto shadow-lg">
                    {filteredSuggestions.map(s => (
                        <li key={s.name} className="p-2 hover:bg-blue-100 cursor-pointer" onMouseDown={() => onSelect(s.name)}>
                            {s.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const QuotationForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState<QuotationRequest>(newEmptyQuotation());
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDrawingModalOpen, setIsDrawingModalOpen] = useState(false);
  const [currentItemIdForDrawing, setCurrentItemIdForDrawing] = useState<string | null>(null);
  const [aiLoadingItemId, setAiLoadingItemId] = useState<string | null>(null);

  // Data libraries
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [allSystems, setAllSystems] = useState<AluminumSystem[]>([]);
  const [allGlassTypes, setAllGlassTypes] = useState<GlassType[]>([]);
  const [allAccessorySets, setAllAccessorySets] = useState<AccessorySet[]>([]);

  // State for autocomplete
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<{ itemId: string; field: 'system' | 'glass' | 'accessories' } | null>(null);

  const printRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `YCBG_${quotation.code}.pdf`,
  });

  useEffect(() => {
    // Load all data libraries
    setAllCustomers(getAllCustomers());
    setAllSystems(getAllAluminumSystems());
    setAllGlassTypes(getAllGlassTypes());
    setAllAccessorySets(getAllAccessorySets());
    
    const path = location.pathname;
    if (path.startsWith('/view/')) {
      try {
        const data = path.substring('/view/'.length);
        const decodedData = JSON.parse(atob(data));
        setQuotation(decodedData);
        setIsReadOnly(true);
      } catch (error) {
        console.error("Failed to parse shared data:", error);
        alert("Link chia sẻ không hợp lệ hoặc đã bị hỏng.");
        navigate('/');
      }
    } else if (id) {
      const existingQuotation = getQuotationById(id);
      if (existingQuotation) {
        setQuotation(existingQuotation);
        setCustomerSearch(existingQuotation.customerName); // pre-fill search
      } else {
        navigate('/');
      }
    } else {
        setQuotation(newEmptyQuotation());
    }
  }, [id, location.pathname, navigate]);
  
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const processedValue = type === 'number' ? parseFloat(value) || 0 : value;
    setQuotation(prev => ({ ...prev, [name]: processedValue }));
  };
  
  const handleHeaderAutocompleteSelect = (field: 'system' | 'glass', value: string) => {
     setQuotation(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomerSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomerSearch(value);
    if (!value) {
        setQuotation(prev => ({ ...prev, customerCode: '', customerName: '', customerAddress: '' }));
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    setQuotation(prev => ({ ...prev, customerCode: customer.code, customerName: customer.name, customerAddress: customer.address }));
    setCustomerSearch(customer.name);
    setShowCustomerSuggestions(false);
  };

  const filteredCustomers = customerSearch ? allCustomers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase())) : [];

  const handleItemChange = (itemId: string, field: keyof Item, value: any) => {
    setQuotation(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'doorType' && value === DoorType.Vach) updatedItem.openDir = null;
          return updatedItem;
        }
        return item;
      }),
    }));
  };
  
  const handleItemAutocompleteSelect = (itemId: string, field: 'system' | 'glass' | 'accessories', value: string) => {
    let finalValue = value;
    if (field === 'accessories') {
      const selectedSet = allAccessorySets.find(s => s.name === value);
      finalValue = selectedSet ? selectedSet.description : value;
    }
    handleItemChange(itemId, field, finalValue);
    setActiveSuggestion(null);
  };

  const handleImageUpload = (itemId: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => { handleItemChange(itemId, 'imageUrl', reader.result as string); };
    reader.readAsDataURL(file);
  };
  
  const openDrawingModal = (itemId: string) => {
    setCurrentItemIdForDrawing(itemId);
    setIsDrawingModalOpen(true);
  };

  const handleSaveDrawing = (dataUrl: string) => {
    if (currentItemIdForDrawing) {
      handleItemChange(currentItemIdForDrawing, 'imageUrl', dataUrl);
    }
    setIsDrawingModalOpen(false);
    setCurrentItemIdForDrawing(null);
  };

  const handleAiSuggest = async (itemId: string, doorName: string) => {
    if (!doorName) {
        alert("Vui lòng nhập Tên cửa để dùng gợi ý AI.");
        return;
    }
    setAiLoadingItemId(itemId);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Dựa vào tên cửa "${doorName}" cho một công trình tại Việt Nam, hãy gợi ý thông số kỹ thuật. Trả về dưới dạng JSON.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        system: { type: Type.STRING, description: "Hệ nhôm được đề xuất (ví dụ: Xingfa Class A, Aluman-DW50)." },
                        glass: { type: Type.STRING, description: "Loại kính phù hợp (ví dụ: Kính cường lực 10mm, Kính hộp 5-9-5)." },
                        accessories: { type: Type.STRING, description: "Các phụ kiện đi kèm (ví dụ: Bản lề 3D, Khóa đa điểm, Tay nắm)." }
                    },
                    required: ["system", "glass", "accessories"]
                }
            }
        });

        const jsonString = response.text;
        const suggestions = JSON.parse(jsonString);

        setQuotation(prev => ({
            ...prev,
            items: prev.items.map(item => {
                if (item.id === itemId) {
                    return { ...item, system: suggestions.system || item.system, glass: suggestions.glass || item.glass, accessories: suggestions.accessories || item.accessories };
                }
                return item;
            }),
        }));
        showToast("AI đã gợi ý xong!");

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        alert("Đã có lỗi xảy ra khi gọi AI. Vui lòng thử lại.");
        showToast("Gợi ý AI thất bại.");
    } finally {
        setAiLoadingItemId(null);
    }
};

  const addItem = () => { setQuotation(prev => ({ ...prev, items: [...prev.items, newEmptyItem()] })); };

  const cloneItem = (itemId: string) => {
    const itemToClone = quotation.items.find(item => item.id === itemId);
    if (itemToClone) {
      const newItem = { ...itemToClone, id: crypto.randomUUID() };
      const index = quotation.items.findIndex(item => item.id === itemId);
      const newItems = [...quotation.items];
      newItems.splice(index + 1, 0, newItem);
      setQuotation(prev => ({ ...prev, items: newItems }));
    }
  };

  const removeItem = (itemId: string) => { setQuotation(prev => ({ ...prev, items: prev.items.filter(item => item.id !== itemId) })); };
  
  const validateForm = (): boolean => {
    if (!quotation.date || !quotation.customerName) {
      alert('Vui lòng điền Ngày lập và Tên Khách Hàng.'); return false;
    }
    if (quotation.items.length === 0) {
      alert('Phải có ít nhất một hạng mục trong phiếu.'); return false;
    }
    for (const item of quotation.items) {
      if (!item.doorType) { alert(`Hạng mục "${item.doorName || 'Chưa có tên'}" phải chọn Loại.`); return false; }
      if (item.doorType !== DoorType.Vach && !item.openDir) { alert(`Hạng mục "${item.doorName || 'Chưa có tên'}" phải chọn Hướng mở.`); return false; }
      if (item.quantity < 1) { alert(`Số lượng của hạng mục "${item.doorName || 'Chưa có tên'}" phải là số nguyên dương.`); return false; }
    }
    return true;
  };

  const handleSave = (status: Status) => {
    if (isReadOnly) return;
    const finalQuotation = { ...quotation, status, customerName: customerSearch };
    setQuotation(finalQuotation); 
    if (!validateForm()) return;
    saveQuotation(finalQuotation);
    showToast(`Đã lưu phiếu thành công với trạng thái: ${status}`);
    navigate('/');
  };
  
  const handleShare = () => {
    try {
        const data = btoa(JSON.stringify(quotation));
        const url = `${window.location.origin}${window.location.pathname}#/view/${data}`;
        navigator.clipboard.writeText(url);
        showToast('Đã sao chép link chia sẻ!');
    } catch (error) {
        console.error("Failed to create share link:", error);
        alert("Không thể tạo link chia sẻ.");
    }
  };
  
  const renderAutocomplete = (item: Item, field: 'system' | 'glass' | 'accessories') => {
    let suggestions: {name: string}[] = [];
    if (field === 'system') suggestions = allSystems;
    if (field === 'glass') suggestions = allGlassTypes;
    if (field === 'accessories') suggestions = allAccessorySets;
    
    const value = item[field] || '';
    const filteredSuggestions = value ? suggestions.filter(s => s.name.toLowerCase().includes(value.toLowerCase())) : [];

    return (
         <div className="relative w-full">
            {field === 'accessories' ? (
                 <textarea
                    placeholder="Phụ kiện"
                    value={value}
                    onChange={e => handleItemChange(item.id, field, e.target.value)}
                    onFocus={() => setActiveSuggestion({ itemId: item.id, field })}
                    onBlur={() => setTimeout(() => setActiveSuggestion(null), 200)}
                    className="p-2 border rounded-md w-full"
                    rows={2}
                 />
            ) : (
                <input
                    type="text"
                    placeholder={field === 'system' ? 'Hệ' : 'Kính'}
                    value={value}
                    onChange={e => handleItemChange(item.id, field, e.target.value)}
                    onFocus={() => setActiveSuggestion({ itemId: item.id, field })}
                    onBlur={() => setTimeout(() => setActiveSuggestion(null), 200)}
                    className="p-2 border rounded-md w-full"
                    autoComplete="off"
                />
            )}
           
            {activeSuggestion?.itemId === item.id && activeSuggestion?.field === field && filteredSuggestions.length > 0 && (
                <ul className="absolute z-20 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-auto shadow-lg">
                    {filteredSuggestions.map(s => (
                        <li key={s.name} className="p-2 hover:bg-blue-100 cursor-pointer" onMouseDown={() => handleItemAutocompleteSelect(item.id, field, s.name)}>
                            {s.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
       {toastMessage && (<div className="fixed top-5 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg z-50">{toastMessage}</div>)}
      <DrawingModal isOpen={isDrawingModalOpen} onClose={() => setIsDrawingModalOpen(false)} onSave={handleSaveDrawing} />
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-800">{id ? `Sửa Phiếu ${quotation.code}` : 'Tạo Phiếu Yêu Cầu Báo Giá Mới'}</h1>
          <button onClick={() => navigate('/')} className="text-gray-600 hover:text-gray-900">&larr; Quay lại danh sách</button>
        </div>

        <fieldset disabled={isReadOnly} className="space-y-6">
            <div className="border-b pb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Thông tin chung</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div><label className="block text-sm font-medium text-gray-600">Số phiếu</label><input type="text" value={quotation.code} readOnly className="mt-1 p-2 w-full border rounded-md bg-gray-100" /></div>
                    <div><label className="block text-sm font-medium text-gray-600">Ngày lập *</label><input type="date" name="date" value={quotation.date} onChange={handleHeaderChange} className="mt-1 p-2 w-full border rounded-md" /></div>
                    <div><label className="block text-sm font-medium text-gray-600">Người yêu cầu</label>
                        <div className="mt-2 flex gap-4">
                            <label><input type="radio" name="requesterType" value={RequesterType.NVKD} checked={quotation.requesterType === RequesterType.NVKD} onChange={handleHeaderChange} className="mr-1" />{RequesterType.NVKD}</label>
                            <label><input type="radio" name="requesterType" value={RequesterType.Other} checked={quotation.requesterType === RequesterType.Other} onChange={handleHeaderChange} className="mr-1" />{RequesterType.Other}</label>
                        </div>
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    <div><label className="block text-sm font-medium text-gray-600">Hệ</label><AutocompleteInput name="system" value={quotation.system} onChange={(e) => handleHeaderChange(e)} onSelect={(val) => handleHeaderAutocompleteSelect('system', val)} suggestions={allSystems} /></div>
                    <div><label className="block text-sm font-medium text-gray-600">Màu</label><input type="text" name="color" value={quotation.color} onChange={handleHeaderChange} className="mt-1 p-2 w-full border border-gray-300 rounded-md" /></div>
                    <div><label className="block text-sm font-medium text-gray-600">Kính</label><AutocompleteInput name="glass" value={quotation.glass} onChange={handleHeaderChange} onSelect={(val) => handleHeaderAutocompleteSelect('glass', val)} suggestions={allGlassTypes} /></div>
                    <div><label className="block text-sm font-medium text-gray-600">Sơn</label><input type="text" name="paint" value={quotation.paint} onChange={handleHeaderChange} className="mt-1 p-2 w-full border border-gray-300 rounded-md" /></div>
                    <div><label className="block text-sm font-medium text-gray-600">Chiết khấu (%)</label><input type="number" name="discountPercentage" value={quotation.discountPercentage || 0} onChange={handleHeaderChange} className="mt-1 p-2 w-full border border-gray-300 rounded-md" min="0" step="0.1" /></div>
                    <div className="col-span-1 lg:col-span-2"><label className="block text-sm font-medium text-gray-600">Vận chuyển</label><input type="text" name="shipping" value={quotation.shipping} onChange={handleHeaderChange} className="mt-1 p-2 w-full border border-gray-300 rounded-md" /></div>
                </div>
            </div>

            <div className="border-b pb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Thông tin khách hàng</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     <div className="relative">
                        <label className="block text-sm font-medium text-gray-600">Tên KH * (Gõ để tìm)</label>
                        <input type="text" name="customerName" value={customerSearch} onChange={handleCustomerSearchChange} onFocus={() => setShowCustomerSuggestions(true)} onBlur={() => setTimeout(() => setShowCustomerSuggestions(false), 200)} className="mt-1 p-2 w-full border border-gray-300 rounded-md" autoComplete="off" />
                        {showCustomerSuggestions && filteredCustomers.length > 0 && (
                            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-auto shadow-lg">
                                {filteredCustomers.map(c => (<li key={c.id} className="p-2 hover:bg-blue-100 cursor-pointer" onMouseDown={() => handleSelectCustomer(c)}>{c.name}</li>))}
                            </ul>
                        )}
                    </div>
                    <div><label className="block text-sm font-medium text-gray-600">Mã số KH</label><input type="text" name="customerCode" value={quotation.customerCode} onChange={handleHeaderChange} className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-gray-50" readOnly /></div>
                    <div className="col-span-1 lg:col-span-3"><label className="block text-sm font-medium text-gray-600">Địa chỉ KH</label><input type="text" name="customerAddress" value={quotation.customerAddress} onChange={handleHeaderChange} className="mt-1 p-2 w-full border border-gray-300 rounded-md bg-gray-50" readOnly /></div>
                </div>
            </div>

            <div>
                 <h2 className="text-xl font-semibold text-gray-700 mb-4">Danh sách hạng mục</h2>
                 <div className="space-y-4">
                     {quotation.items.map((item, index) => (
                         <div key={item.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                             <span className="absolute top-2 left-2 text-lg font-bold text-gray-300">#{index+1}</span>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="flex items-center gap-1">
                                  <input type="text" placeholder="Tên cửa" value={item.doorName} onChange={e => handleItemChange(item.id, 'doorName', e.target.value)} className="p-2 border rounded-md w-full" />
                                  <button type="button" onClick={() => handleAiSuggest(item.id, item.doorName)} disabled={aiLoadingItemId === item.id || isReadOnly} className="p-2 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0" title="Gợi ý bằng AI">
                                      {aiLoadingItemId === item.id ? (<svg className="animate-spin h-5 w-5 text-purple-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>) : (<MagicIcon className="w-5 h-5"/>)}
                                  </button>
                                </div>
                                 {renderAutocomplete(item, 'system')}
                                 {renderAutocomplete(item, 'glass')}
                                 <input type="number" placeholder="Số lượng" value={item.quantity} min="1" onChange={e => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 1)} className="p-2 border rounded-md" />
                                 <div className="col-span-1 md:col-span-2 lg:col-span-4">{renderAutocomplete(item, 'accessories')}</div>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 items-center">
                                <div>
                                    <div className="flex flex-wrap gap-4 mb-2">
                                        <label className="block text-sm font-medium">Loại *</label>
                                        <label><input type="radio" name={`doorType-${item.id}`} value={DoorType.Door} checked={item.doorType === DoorType.Door} onChange={() => handleItemChange(item.id, 'doorType', DoorType.Door)} /> {DoorType.Door}</label>
                                        <label><input type="radio" name={`doorType-${item.id}`} value={DoorType.Window} checked={item.doorType === DoorType.Window} onChange={() => handleItemChange(item.id, 'doorType', DoorType.Window)} /> {DoorType.Window}</label>
                                        <label><input type="radio" name={`doorType-${item.id}`} value={DoorType.Vach} checked={item.doorType === DoorType.Vach} onChange={() => handleItemChange(item.id, 'doorType', DoorType.Vach)} /> {DoorType.Vach}</label>
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        <label className={`block text-sm font-medium ${item.doorType === DoorType.Vach ? 'text-gray-400' : ''}`}>Hướng mở *</label>
                                        <label className={item.doorType === DoorType.Vach ? 'text-gray-400' : ''}><input type="radio" name={`openDir-${item.id}`} value={OpenDirection.Inward} checked={item.openDir === OpenDirection.Inward} onChange={() => handleItemChange(item.id, 'openDir', OpenDirection.Inward)} disabled={item.doorType === DoorType.Vach}/> {OpenDirection.Inward}</label>
                                        <label className={item.doorType === DoorType.Vach ? 'text-gray-400' : ''}><input type="radio" name={`openDir-${item.id}`} value={OpenDirection.Outward} checked={item.openDir === OpenDirection.Outward} onChange={() => handleItemChange(item.id, 'openDir', OpenDirection.Outward)} disabled={item.doorType === DoorType.Vach}/> {OpenDirection.Outward}</label>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="file" accept="image/*" onChange={e => e.target.files && handleImageUpload(item.id, e.target.files[0])} className="text-sm text-slate-500 w-full file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                                    <button type="button" onClick={() => openDrawingModal(item.id)} className="p-2 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-full" title="Vẽ phác thảo"><PaintBrushIcon className="w-5 h-5"/></button>
                                    {item.imageUrl && <img src={item.imageUrl} alt="preview" className="w-12 h-12 object-cover rounded-md border" />}
                                </div>
                             </div>
                             <div className="absolute top-2 right-2 flex gap-2">
                                <button onClick={() => cloneItem(item.id)} className="text-blue-500 hover:text-blue-700" title="Sao chép"><CloneIcon className="w-5 h-5"/></button>
                                {quotation.items.length > 1 && <button onClick={() => removeItem(item.id)} className="text-red-500 hover:red-700" title="Xóa"><TrashIcon className="w-5 h-5"/></button>}
                             </div>
                         </div>
                     ))}
                 </div>
                 {!isReadOnly && <button onClick={addItem} className="mt-4 flex items-center gap-2 text-blue-600 font-semibold py-2 px-4 border border-blue-600 rounded-lg hover:bg-blue-50 transition"> <PlusIcon className="w-5 h-5"/> Thêm hạng mục </button>}
            </div>
        </fieldset>
        
        <div className="mt-8 flex flex-col md:flex-row justify-end items-center gap-4">
            <button onClick={handleShare} className="flex items-center gap-2 w-full md:w-auto justify-center bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-700 transition"><ShareIcon className="w-5 h-5"/>Sao chép Link</button>
            <button onClick={handlePrint} className="flex items-center gap-2 w-full md:w-auto justify-center bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition"><PrintIcon className="w-5 h-5"/>In / Xuất PDF</button>
           {!isReadOnly && ( <>
                <button onClick={() => handleSave(Status.Draft)} className="w-full md:w-auto justify-center bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-yellow-600 transition">Lưu nháp</button>
                <button onClick={() => handleSave(Status.Final)} className="w-full md:w-auto justify-center bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition">Hoàn tất & Lưu</button>
            </> )}
        </div>
      </div>
      
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <QuotationPrintView ref={printRef} quotation={quotation} />
      </div>
    </div>
  );
};

export default QuotationForm;