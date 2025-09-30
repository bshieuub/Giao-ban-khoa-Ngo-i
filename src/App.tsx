import React, { useState, useEffect } from 'react';
import type { ReportData, SurgeryDetail, SeverePatientHandover } from './types';
import { exportToPowerPoint } from './services/powerpointService';
import Header from './components/Header';
import SectionCard from './components/SectionCard';
import InputField from './components/InputField';
import TextAreaField from './components/TextAreaField';

const getInitialData = (date: string): ReportData => ({
  reportDate: date,
  onDutyTeam: { doctors: '', nurses: '' },
  previousPatients: 0,
  newAdmissions: 0,
  discharges: 0,
  transfersOut: 0,
  transfersIn: 0,
  hospitalTransfersOut: 0,
  currentPatients: 0,
  outpatients: 0,
  minorSurgeries: 0,
  scheduledSurgeriesCount: 0,
  emergencySurgeriesCount: 0,
  scheduledSurgeriesDetails: [],
  emergencySurgeriesDetails: [],
  severePatientHandovers: [],
  additionalNotes: '',
});


const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState<ReportData>(getInitialData(currentDate));
  const [isExporting, setIsExporting] = useState(false);

  // Load data from localStorage when the date changes
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(`report_${currentDate}`);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Handle backward compatibility for old onDutyTeam string format
        if (typeof parsedData.onDutyTeam === 'string') {
          parsedData.onDutyTeam = { doctors: parsedData.onDutyTeam, nurses: '' };
        }
        setReportData({ ...getInitialData(currentDate), ...parsedData });
      } else {
        setReportData(getInitialData(currentDate));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage:", error);
      setReportData(getInitialData(currentDate));
    }
  }, [currentDate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (name === 'reportDate') {
      setCurrentDate(value); // This will trigger the useEffect to load data
      return;
    }
    setReportData(prevData => ({
      ...prevData,
      [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value,
    }));
  };
  
  const handleOnDutyTeamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; // name will be 'doctors' or 'nurses'
    setReportData(prevData => ({
      ...prevData,
      onDutyTeam: {
        ...prevData.onDutyTeam,
        [name]: value,
      }
    }));
  };

  // --- Surgery Handlers ---
  const handleAddSurgery = (type: 'scheduled' | 'emergency') => {
    const newSurgery: SurgeryDetail = { id: crypto.randomUUID(), patientName: '', birthYear: '', diagnosis: '', procedure: '', surgeon: '' };
    if (type === 'scheduled') {
      setReportData(prev => ({ ...prev, scheduledSurgeriesDetails: [...prev.scheduledSurgeriesDetails, newSurgery] }));
    } else {
      setReportData(prev => ({ ...prev, emergencySurgeriesDetails: [...prev.emergencySurgeriesDetails, newSurgery] }));
    }
  };

  const handleRemoveSurgery = (type: 'scheduled' | 'emergency', id: string) => {
     if (type === 'scheduled') {
      setReportData(prev => ({ ...prev, scheduledSurgeriesDetails: prev.scheduledSurgeriesDetails.filter(s => s.id !== id) }));
    } else {
      setReportData(prev => ({ ...prev, emergencySurgeriesDetails: prev.emergencySurgeriesDetails.filter(s => s.id !== id) }));
    }
  };

  const handleSurgeryDetailChange = (type: 'scheduled' | 'emergency', id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const key = name as keyof Omit<SurgeryDetail, 'id'>;
    const updateArray = (details: SurgeryDetail[]) => details.map(s => s.id === id ? { ...s, [key]: value } : s);
    if (type === 'scheduled') {
      setReportData(prev => ({ ...prev, scheduledSurgeriesDetails: updateArray(prev.scheduledSurgeriesDetails) }));
    } else {
      setReportData(prev => ({ ...prev, emergencySurgeriesDetails: updateArray(prev.emergencySurgeriesDetails) }));
    }
  };

  // --- Severe Patient Handover Handlers ---
  const handleAddHandover = () => {
    const newHandover: SeverePatientHandover = { id: crypto.randomUUID(), patientName: '', birthYear: '', diagnosis: '', currentStatus: '' };
    setReportData(prev => ({ ...prev, severePatientHandovers: [...prev.severePatientHandovers, newHandover] }));
  };

  const handleRemoveHandover = (id: string) => {
    setReportData(prev => ({ ...prev, severePatientHandovers: prev.severePatientHandovers.filter(h => h.id !== id) }));
  };

  const handleHandoverChange = (id: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const key = name as keyof Omit<SeverePatientHandover, 'id'>;
    setReportData(prev => ({
      ...prev,
      severePatientHandovers: prev.severePatientHandovers.map(h => h.id === id ? { ...h, [key]: value } : h)
    }));
  };

  // --- Data Persistence and Export ---
  const handleSave = () => {
    try {
      localStorage.setItem(`report_${reportData.reportDate}`, JSON.stringify(reportData));
      alert(`Đã lưu báo cáo cho ngày ${new Date(reportData.reportDate).toLocaleDateString('vi-VN')}`);
    } catch (error) {
      console.error("Failed to save report:", error);
      alert("Lưu báo cáo thất bại. Có thể bộ nhớ đã đầy.");
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportToPowerPoint(reportData);
    } catch (error) {
      console.error("Failed to export PowerPoint:", error);
      alert("Đã có lỗi xảy ra khi xuất file PowerPoint.");
    } finally {
      setIsExporting(false);
    }
  };
  
  // --- Render Functions ---
  const renderSurgeryDetails = (type: 'scheduled' | 'emergency') => {
    const details = type === 'scheduled' ? reportData.scheduledSurgeriesDetails : reportData.emergencySurgeriesDetails;
    const title = type === 'scheduled' ? 'Chi tiết mổ chương trình' : 'Chi tiết mổ cấp cứu';
    const buttonText = type === 'scheduled' ? 'Thêm ca mổ chương trình' : 'Thêm ca mổ cấp cứu';

    return (
      <SectionCard title={title}>
        <div className="space-y-4">
          {details.map((surgery, index) => (
            <div key={surgery.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50 relative">
              <button onClick={() => handleRemoveSurgery(type, surgery.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-600 transition-colors" aria-label={`Xóa ca mổ ${index + 1}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <p className="font-bold text-md text-slate-700 mb-4">Ca mổ #{index + 1}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Tên bệnh nhân" name="patientName" value={surgery.patientName} onChange={(e) => handleSurgeryDetailChange(type, surgery.id, e)} placeholder="Nguyễn Văn A" />
                <InputField label="Năm sinh" name="birthYear" type="number" value={surgery.birthYear} onChange={(e) => handleSurgeryDetailChange(type, surgery.id, e)} placeholder="1980" />
                <InputField label="Chẩn đoán" name="diagnosis" value={surgery.diagnosis} onChange={(e) => handleSurgeryDetailChange(type, surgery.id, e)} placeholder="VD: Viêm ruột thừa cấp" />
                <InputField label="Xử trí" name="procedure" value={surgery.procedure} onChange={(e) => handleSurgeryDetailChange(type, surgery.id, e)} placeholder="VD: Cắt ruột thừa nội soi" />
                <div className="md:col-span-2">
                  <InputField label="Phẫu thuật viên" name="surgeon" value={surgery.surgeon} onChange={(e) => handleSurgeryDetailChange(type, surgery.id, e)} placeholder="BS. Nguyễn Văn B" />
                </div>
              </div>
            </div>
          ))}
          <div className="flex justify-start">
            <button onClick={() => handleAddSurgery(type)} className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition-colors">{buttonText}</button>
          </div>
        </div>
      </SectionCard>
    );
  };

  const renderSevereHandovers = () => {
    return (
      <SectionCard title="Bệnh nặng trong kíp trực và bàn giao kíp sau">
        <div className="space-y-4">
          {reportData.severePatientHandovers.map((handover, index) => (
            <div key={handover.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50 relative">
              <button onClick={() => handleRemoveHandover(handover.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-600 transition-colors" aria-label={`Xóa bệnh nhân ${index + 1}`}>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <p className="font-bold text-md text-slate-700 mb-4">Bệnh nhân #{index + 1}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Họ tên bệnh nhân" name="patientName" value={handover.patientName} onChange={(e) => handleHandoverChange(handover.id, e)} placeholder="Nguyễn Văn A"/>
                <InputField label="Năm sinh" name="birthYear" type="number" value={handover.birthYear} onChange={(e) => handleHandoverChange(handover.id, e)} placeholder="1980" />
                <div className="md:col-span-2">
                  <InputField label="Chẩn đoán" name="diagnosis" value={handover.diagnosis} onChange={(e) => handleHandoverChange(handover.id, e)} placeholder="VD: Sốc đa chấn thương" />
                </div>
                <div className="md:col-span-2">
                  <TextAreaField label="Tình hình hiện tại cần theo dõi tiếp" name="currentStatus" value={handover.currentStatus} onChange={(e) => handleHandoverChange(handover.id, e)} rows={3} placeholder="Mô tả diễn biến, các y lệnh cần theo dõi..." />
                </div>
              </div>
            </div>
          ))}
          <div className="flex justify-start">
            <button onClick={handleAddHandover} className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition-colors">Thêm bệnh nhân nặng</button>
          </div>
        </div>
      </SectionCard>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <Header />
      <main className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        <div className="space-y-6">
          <SectionCard title="Thông tin chung">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Tua trực ngày" type="date" name="reportDate" value={reportData.reportDate} onChange={handleInputChange} />
              <div />
              <InputField label="Bác sĩ trực" type="text" name="doctors" value={reportData.onDutyTeam.doctors} onChange={handleOnDutyTeamChange} placeholder="BS. Nguyễn Văn A,..." />
              <InputField label="Điều dưỡng trực" type="text" name="nurses" value={reportData.onDutyTeam.nurses} onChange={handleOnDutyTeamChange} placeholder="ĐD. Trần Thị B,..." />
            </div>
          </SectionCard>

          <SectionCard title="Tình hình người bệnh">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <InputField label="Bệnh nhân cũ" type="number" name="previousPatients" value={reportData.previousPatients.toString()} onChange={handleInputChange} />
              <InputField label="Vào viện" type="number" name="newAdmissions" value={reportData.newAdmissions.toString()} onChange={handleInputChange} />
              <InputField label="Ra viện" type="number" name="discharges" value={reportData.discharges.toString()} onChange={handleInputChange} />
              <InputField label="Chuyển khoa" type="number" name="transfersOut" value={reportData.transfersOut.toString()} onChange={handleInputChange} />
              <InputField label="Khoa khác chuyển đến" type="number" name="transfersIn" value={reportData.transfersIn.toString()} onChange={handleInputChange} />
              <InputField label="Chuyển viện" type="number" name="hospitalTransfersOut" value={reportData.hospitalTransfersOut.toString()} onChange={handleInputChange} />
              <InputField label="Hiện có" type="number" name="currentPatients" value={reportData.currentPatients.toString()} onChange={handleInputChange} />
              <InputField label="Bệnh phòng khám" type="number" name="outpatients" value={reportData.outpatients.toString()} onChange={handleInputChange} />
              <InputField label="Tiểu phẫu/Bó bột" type="number" name="minorSurgeries" value={reportData.minorSurgeries.toString()} onChange={handleInputChange} />
            </div>
          </SectionCard>

          <SectionCard title="Phẫu thuật (Tổng quan)">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Số ca mổ chương trình" type="number" name="scheduledSurgeriesCount" value={reportData.scheduledSurgeriesCount.toString()} onChange={handleInputChange} />
                <InputField label="Số ca mổ cấp cứu" type="number" name="emergencySurgeriesCount" value={reportData.emergencySurgeriesCount.toString()} onChange={handleInputChange} />
            </div>
          </SectionCard>

          {renderSurgeryDetails('scheduled')}
          {renderSurgeryDetails('emergency')}
          
          {renderSevereHandovers()}

          <SectionCard title="Ghi chú thêm">
            <TextAreaField
              label="Các vấn đề khác cần báo cáo"
              name="additionalNotes"
              value={reportData.additionalNotes}
              onChange={handleInputChange}
              rows={4}
              placeholder="Ghi nhận các vấn đề phát sinh, kiến nghị, hoặc thông tin quan trọng khác..."
            />
          </SectionCard>

          <div className="flex justify-end items-center gap-4 pt-4">
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-75 transition-all duration-200"
            >
              Lưu Báo cáo
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xuất...
                </>
              ) : (
                'Xuất ra PowerPoint'
              )}
            </button>
          </div>
        </div>
      </main>
      <footer className="text-center text-xs text-slate-500 py-4">
        © 2024 - bshieuubdl@gmail.com
      </footer>
    </div>
  );
};

export default App;
