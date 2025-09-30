export interface SurgeryDetail {
  id: string; // Dùng làm key trong React
  patientName: string;
  birthYear: string; // Dùng string để xử lý input rỗng
  diagnosis: string;
  procedure: string;
  surgeon: string;
}

export interface SeverePatientHandover {
  id: string;
  patientName: string;
  birthYear: string;
  diagnosis: string;
  currentStatus: string;
}

export interface ReportData {
  reportDate: string;
  onDutyTeam: {
    doctors: string;
    nurses: string;
  };

  // Cập nhật các trường Tình hình người bệnh
  previousPatients: number;
  newAdmissions: number;
  discharges: number;
  transfersOut: number; // Chuyển khoa khác
  transfersIn: number; // Khoa khác chuyển tới
  hospitalTransfersOut: number; // Chuyển viện
  currentPatients: number;
  outpatients: number;
  minorSurgeries: number;

  // Phẫu thuật
  scheduledSurgeriesCount: number;
  emergencySurgeriesCount: number;
  scheduledSurgeriesDetails: SurgeryDetail[];
  emergencySurgeriesDetails: SurgeryDetail[];

  // Thay thế Ghi chú/Kế hoạch bằng danh sách bàn giao
  severePatientHandovers: SeverePatientHandover[];

  // Ghi chú thêm
  additionalNotes: string;
}
