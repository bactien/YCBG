import React, { useState, useEffect } from 'react';
import { QuotationRequest, DoorType, OpenDirection } from '../types';
import { getCompanyLogo } from '../services/settingsService';

interface QuotationPrintViewProps {
  quotation: QuotationRequest;
}

const QuotationPrintView = React.forwardRef<HTMLDivElement, QuotationPrintViewProps>(({ quotation }, ref) => {
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    setLogo(getCompanyLogo());
  }, []);
    
  const itemsPerPage = 6;
  const itemChunks = [];
  for (let i = 0; i < quotation.items.length; i += itemsPerPage) {
    itemChunks.push(quotation.items.slice(i, i + itemsPerPage));
  }

  const Checkbox = ({ checked, label }: { checked: boolean, label: string }) => (
    <div className="flex items-center space-x-1">
      <div className="w-3 h-3 border border-black flex items-center justify-center">
        {checked && <div className="w-2 h-2 bg-black"></div>}
      </div>
      <span className="text-xs">{label}</span>
    </div>
  );

  return (
    <div ref={ref} className="print-container font-serif text-black">
      {itemChunks.map((chunk, pageIndex) => (
        <div key={pageIndex} className="a4-page p-8 mx-auto bg-white shadow-lg">
          {/* Header */}
           <div className="flex justify-between items-start mb-4">
              <div className="w-1/4">
                {logo && <img src={logo} alt="Company Logo" className="max-h-24 max-w-full object-contain" />}
              </div>
              <div className="w-1/2 text-center pt-2">
                <h1 className="text-xl font-bold">MẪU 1 – PHIẾU YÊU CẦU BÁO GIÁ</h1>
              </div>
              <div className="w-1/4"></div> {/* Spacer */}
            </div>
          <div className="border-2 border-black p-2">
            <div className="grid grid-cols-4 gap-x-4 text-sm">
              <div className="font-bold">Số:</div><div>{quotation.code}</div>
              <div className="font-bold">Ngày:</div><div>{new Date(quotation.date).toLocaleDateString('vi-VN')}</div>
              <div className="font-bold">Người yêu cầu:</div><div className="col-span-3">{quotation.requesterType}</div>
              <div className="font-bold">Hệ:</div><div>{quotation.system}</div>
              <div className="font-bold">Màu:</div><div>{quotation.color}</div>
              <div className="font-bold">Mã số KH:</div><div>{quotation.customerCode}</div>
              <div className="font-bold">Tên KH:</div><div>{quotation.customerName}</div>
              <div className="font-bold">Kính:</div><div>{quotation.glass}</div>
              <div className="font-bold">Vận chuyển:</div><div>{quotation.shipping}</div>
              <div className="font-bold">Sơn:</div><div>{quotation.paint}</div>
              {quotation.discountPercentage && quotation.discountPercentage > 0 && (
                <>
                  <div className="font-bold">Chiết khấu (%):</div><div>{quotation.discountPercentage}</div>
                </>
              )}
              <div className="font-bold">Địa chỉ KH:</div><div className="col-span-3">{quotation.customerAddress}</div>
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {chunk.map(item => (
              <div key={item.id} className="border-2 border-black">
                <div className="grid grid-cols-4 border-b-2 border-black text-sm">
                  <div className="p-1 border-r-2 border-black"><span className="font-bold">Tên cửa:</span> {item.doorName}</div>
                  <div className="p-1 border-r-2 border-black"><span className="font-bold">Hệ:</span> {item.system}</div>
                  <div className="p-1 border-r-2 border-black"><span className="font-bold">Kính:</span> {item.glass}</div>
                  <div className="p-1"><span className="font-bold">Số lượng:</span> {item.quantity}</div>
                </div>
                 {item.accessories && (
                  <div className="p-1 border-b-2 border-black text-sm">
                    <span className="font-bold">Phụ kiện:</span> {item.accessories}
                  </div>
                )}
                <div className="grid grid-cols-2 h-40">
                  <div className="flex items-center justify-center border-r-2 border-black p-1">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="Sketch" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-gray-400 text-sm">No Image</span>
                    )}
                  </div>
                  <div className="flex flex-col justify-center space-y-4 p-2">
                    <div className="flex space-x-4">
                       <Checkbox checked={item.doorType === DoorType.Door} label={DoorType.Door} />
                       <Checkbox checked={item.doorType === DoorType.Window} label={DoorType.Window} />
                       <Checkbox checked={item.doorType === DoorType.Vach} label={DoorType.Vach} />
                    </div>
                     <div className="flex space-x-4">
                       <Checkbox checked={item.openDir === OpenDirection.Inward} label={OpenDirection.Inward} />
                       <Checkbox checked={item.openDir === OpenDirection.Outward} label={OpenDirection.Outward} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .a4-page {
            width: 210mm;
            height: 297mm;
            margin: 0;
            box-shadow: none;
            page-break-after: always;
          }
        }
        @page {
          size: A4;
          margin: 0;
        }
        .print-container {
          font-family: 'Times New Roman', serif;
        }
        .a4-page {
          width: 210mm;
          min-height: 297mm;
        }
      `}</style>
    </div>
  );
});

export default QuotationPrintView;