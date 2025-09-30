import type { ReportData, SurgeryDetail, SeverePatientHandover } from '../types';
import { buhLogoBase64 } from '../assets/logo';

// Let TypeScript know that PptxGenJS is available on the global window object
declare var PptxGenJS: any;

// For File System Access API typing
interface FileSystemFileHandle {
  createWritable(): Promise<FileSystemWritableFileStream>;
}

interface FileSystemWritableFileStream {
  write(data: any): Promise<void>;
  close(): Promise<void>;
}

interface SaveFilePickerOptions {
  suggestedName?: string;
  types?: Array<{
    description: string;
    accept: { [mimeType: string]: string[] };
  }>;
}

declare global {
  interface Window {
    showSaveFilePicker(options?: SaveFilePickerOptions): Promise<FileSystemFileHandle>;
  }
}


export const exportToPowerPoint = async (data: ReportData): Promise<void> => {
  try {
    const pptx = new PptxGenJS();

    // --- Presentation Properties ---
    pptx.layout = 'LAYOUT_WIDE';
    pptx.author = 'bshieuubdl@gmail.com';
    pptx.company = 'BUH';
    pptx.title = `Báo cáo giao ban Khoa Ngoại - ${data.reportDate}`;

    // --- Reusable function to add logo and footer ---
    const addBranding = (slide: any) => {
      // Logo
      slide.addImage({
        data: buhLogoBase64,
        x: 12.3, y: 0.25, w: 0.8, h: 0.8
      });
      // Footer
      slide.addText('bshieuubdl@gmail.com', { 
          x: 0, y: 7.2, w: '100%', h: 0.25, 
          align: 'center', fontSize: 8, color: 'AAAAAA' 
      });
    };

    // --- Slide 1: Title Slide ---
    const titleSlide = pptx.addSlide();
    addBranding(titleSlide);
    titleSlide.background = { color: '003366' };
    titleSlide.addText('BÁO CÁO GIAO BAN KHOA NGOẠI', {
      x: 0.5, y: 1.5, w: '90%', h: 1, align: 'center', fontSize: 36, color: 'FFFFFF', bold: true
    });
    titleSlide.addText(`Tua trực ngày: ${new Date(data.reportDate).toLocaleDateString('vi-VN')}`, {
      x: 0.5, y: 3.0, w: '90%', h: 0.75, align: 'center', fontSize: 24, color: 'F1F1F1'
    });
    const onDutyTeamText = `Bác sĩ: ${data.onDutyTeam.doctors || 'Chưa nhập'}\nĐiều dưỡng: ${data.onDutyTeam.nurses || 'Chưa nhập'}`;
    titleSlide.addText(onDutyTeamText, {
      x: 0.5, y: 4.0, w: '90%', h: 1.0, align: 'center', fontSize: 20, color: 'F1F1F1'
    });

    // Define reusable styles
    const titleOpts = { x: 0.5, y: 0.25, w: '90%', h: 0.75, align: 'center' as const, fontSize: 28, color: '003366', bold: true };
    const tableOpts = { x: 0.5, y: 1.2, w: 12.33, colW: [6.165, 6.165] };
    const cellStyle = { valign: 'middle' as const, fontSize: 16, border: { type: 'solid' as const, pt: 1, color: 'CCCCCC' } };
    const cellHeaderStyle = { ...cellStyle, fill: { color: 'F1F1F1' }, bold: true, align: 'center' as const };
    const cellContentStyle = { ...cellStyle, align: 'center' as const};

    // --- Slide 2: Patient Statistics ---
    const patientSlide = pptx.addSlide();
    addBranding(patientSlide);
    patientSlide.addText('Tình hình người bệnh', titleOpts);
    const patientRows = [
      [{ text: 'Hạng mục', options: cellHeaderStyle }, { text: 'Số lượng', options: cellHeaderStyle }],
      [{ text: 'Bệnh nhân cũ', options: cellStyle }, { text: data.previousPatients, options: cellContentStyle }],
      [{ text: 'Vào viện', options: cellStyle }, { text: data.newAdmissions, options: cellContentStyle }],
      [{ text: 'Ra viện', options: cellStyle }, { text: data.discharges, options: cellContentStyle }],
      [{ text: 'Chuyển khoa', options: cellStyle }, { text: data.transfersOut, options: cellContentStyle }],
      [{ text: 'Khoa khác chuyển đến', options: cellStyle }, { text: data.transfersIn, options: cellContentStyle }],
      [{ text: 'Chuyển viện', options: cellStyle }, { text: data.hospitalTransfersOut, options: cellContentStyle }],
      [{ text: 'Hiện có', options: cellStyle }, { text: data.currentPatients, options: cellContentStyle }],
      [{ text: 'Bệnh phòng khám', options: cellStyle }, { text: data.outpatients, options: cellContentStyle }],
      [{ text: 'Tiểu phẫu/Bó bột', options: cellStyle }, { text: data.minorSurgeries, options: cellContentStyle }],
    ];
    patientSlide.addTable(patientRows, tableOpts);

    // --- Slide 3: Surgical Report (Overview) ---
    const surgeryOverviewSlide = pptx.addSlide();
    addBranding(surgeryOverviewSlide);
    surgeryOverviewSlide.addText('Báo cáo Phẫu thuật - Tổng quan', titleOpts);
    const totalSurgeries = data.scheduledSurgeriesCount + data.emergencySurgeriesCount;
    const surgeryOverviewRows = [
        [{ text: 'Loại phẫu thuật', options: cellHeaderStyle }, { text: 'Số ca', options: cellHeaderStyle }],
        [{ text: 'Mổ chương trình', options: cellStyle }, { text: data.scheduledSurgeriesCount, options: cellContentStyle }],
        [{ text: 'Mổ cấp cứu', options: cellStyle }, { text: data.emergencySurgeriesCount, options: cellContentStyle }],
        [{ text: 'Tổng cộng', options: { ...cellStyle, bold: true } }, { text: totalSurgeries, options: { ...cellContentStyle, bold: true } }],
    ];
    surgeryOverviewSlide.addTable(surgeryOverviewRows, tableOpts);

    // --- Function to create surgery detail slides ---
    const createSurgeryDetailSlide = (title: string, details: SurgeryDetail[]) => {
        if (details.length === 0) return;

        const slide = pptx.addSlide();
        addBranding(slide);
        slide.addText(title, titleOpts);

        const tableHeader = [
            { text: 'STT', options: cellHeaderStyle },
            { text: 'Tên bệnh nhân', options: cellHeaderStyle },
            { text: 'Năm sinh', options: cellHeaderStyle },
            { text: 'Chẩn đoán', options: cellHeaderStyle },
            { text: 'Xử trí', options: cellHeaderStyle },
            { text: 'Phẫu thuật viên', options: cellHeaderStyle },
        ];
        const detailRows: Array<Array<{ text: string | number; options: object }>> = [tableHeader];
        
        details.forEach((surgery, index) => {
            detailRows.push([
                { text: (index + 1).toString(), options: cellContentStyle },
                { text: surgery.patientName || '', options: cellStyle },
                { text: surgery.birthYear || '', options: cellContentStyle },
                { text: surgery.diagnosis || '', options: cellStyle },
                { text: surgery.procedure || '', options: cellStyle },
                { text: surgery.surgeon || '', options: cellStyle },
            ]);
        });
        
        slide.addTable(detailRows, { x: 0.25, y: 1.2, w: '95%', colW: [0.6, 2.5, 1, 2.8, 2.8, 2.5], autoPage: true });
    };

    // --- Create Surgery Detail Slides ---
    createSurgeryDetailSlide('Chi tiết mổ chương trình', data.scheduledSurgeriesDetails);
    createSurgeryDetailSlide('Chi tiết mổ cấp cứu', data.emergencySurgeriesDetails);

    // --- Function to create handover slide ---
    const createHandoverSlide = (title: string, handovers: SeverePatientHandover[]) => {
      const slide = pptx.addSlide();
      addBranding(slide);
      slide.addText(title, titleOpts);

      if (handovers.length === 0) {
          slide.addText('Không có bệnh nhân nặng cần bàn giao.', { x: 0.5, y: 1.5, w: '90%', h: 1, align: 'center', fontSize: 18, color: '555555' });
          return;
      }

      const tableHeader = [
          { text: 'STT', options: { ...cellHeaderStyle, w: 0.5 } },
          { text: 'Họ tên', options: cellHeaderStyle },
          { text: 'Năm sinh', options: cellHeaderStyle },
          { text: 'Chẩn đoán', options: cellHeaderStyle },
          { text: 'Tình hình & Bàn giao', options: cellHeaderStyle },
      ];
      const handoverRows: Array<Array<{ text: string | number; options: object }>> = [tableHeader];

      handovers.forEach((handover, index) => {
          handoverRows.push([
              { text: (index + 1), options: cellContentStyle },
              { text: handover.patientName || '', options: cellStyle },
              { text: handover.birthYear || '', options: cellContentStyle },
              { text: handover.diagnosis || '', options: cellStyle },
              { text: handover.currentStatus || '', options: { ...cellStyle, align: 'left', valign: 'top' } },
          ]);
      });

      slide.addTable(handoverRows, { x: 0.25, y: 1.2, w: '95%', colW: [0.6, 2.2, 1, 3, 5.4], autoPage: true });
    };

    // --- Create Handover Slide ---
    createHandoverSlide('Bệnh nặng và Bàn giao kíp sau', data.severePatientHandovers);

    // --- Function to create notes slide ---
    const createNotesSlide = (title: string, notes: string) => {
      if (!notes || notes.trim() === '') return;

      const slide = pptx.addSlide();
      addBranding(slide);
      slide.addText(title, titleOpts);
      slide.addText(notes, {
          x: 0.5,
          y: 1.5,
          w: '90%',
          h: 5,
          align: 'left',
          valign: 'top',
          fontSize: 18,
          color: '333333',
      });
    };

    // --- Create Notes Slide ---
    createNotesSlide('Ghi chú thêm', data.additionalNotes);

    // --- Save the Presentation ---
    const [year, month, day] = data.reportDate.split('-');
    const fileName = `${day}-${month}-${year}.pptx`;

    // Use File System Access API if available
    if (window.showSaveFilePicker) {
      try {
        const pptxBlob = await pptx.write('blob');
        const handle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [
            {
              description: 'PowerPoint Presentation',
              accept: { 'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(pptxBlob);
        await writable.close();
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Error saving with File System Access API, falling back.', err);
          // Fallback to default download if picker fails for any reason other than cancellation
          await pptx.writeFile({ fileName });
        } else {
            console.log('User cancelled save dialog.');
        }
      }
    } else {
      // Fallback for older browsers
      await pptx.writeFile({ fileName });
    }
  } catch (error) {
    console.error("An error occurred during PowerPoint generation:", error);
    throw error;
  }
};