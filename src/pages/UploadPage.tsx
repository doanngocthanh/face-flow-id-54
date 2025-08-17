import CameraUploadSection from "@/components/upload/CameraUploadSection";
import ResultSection from "@/components/upload/ResultSection";


import AppFooter from "@/components/ui/AppFooter";
import React, { useState } from "react";
import { useUploadApi, useOcrApi, useMrzApi } from "@/hooks/use-ekyc-api";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CameraUpload } from "@/components/ui/camera-upload";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Loader2 } from "lucide-react";
import AppHeader from "@/components/ui/AppHeader";


// Helper for OCR features
function getOcrFeatureLabel(key) {
  const labels = {
    has_portrait: "Ảnh chân dung",
    has_qr_code: "Mã QR",
    has_basic_info: "Thông tin cơ bản",
    has_address_info: "Địa chỉ",
  };
  return labels[key] || key;
}
// Helper for detected fields
// Helper for OCR result fields (for OCR result rendering)
const fieldLabels = {
  cplace_of_birth: "Nơi sinh",
  cdate_of_expiry: "Ngày hết hạn",
  cdate_of_issue: "Ngày cấp"
  // ...add more mappings as needed
};
function getFieldLabel(className) {
  return fieldLabels[className] || className;
}
export function getDetectedFieldLabel(key) {
const labels = {
    birth: "Ngày sinh",
    expiry: "Ngày hết hạn",
    id: "Số định danh",
    name: "Họ tên",
    nationality: "Quốc tịch",
    place_of_origin: "Nguyên quán",
    place_of_residence: "Nơi cư trú",
    portrait: "Ảnh chân dung",
    qr_code: "Mã QR",
    sex: "Giới tính",
    "Date of expiry": "Ngày hết hạn",
    "Date of issue": "Ngày cấp",
    "Date_of_birth": "Ngày sinh",
    "ID": "Số định danh",
    "Name": "Họ tên",
    "Nationality": "Quốc tịch",
    "Place": "Nơi",
    "Place of birth": "Nơi sinh",
    "Sex": "Giới tính",
    address_1: "Địa chỉ 1",
    address_2: "Địa chỉ 2",
    bottom_left: "Góc dưới trái",
    bottom_right: "Góc dưới phải",
    c_full_name: "Họ tên (c)",
    c_id: "Số định danh (c)",
    c_national: "Quốc tịch (c)",
    c_sex: "Giới tính (c)",
    cdate_of_birth: "Ngày sinh (c)",
    cdate_of_expiry: "Ngày hết hạn (c)",
    cdate_of_issue: "Ngày cấp (c)",
    cplace_of_birth: "Nơi sinh (c)",
    date_of_birth: "Ngày sinh",
    top_left: "Góc trên trái",
    top_right: "Góc trên phải",
    // ...add more mappings as needed
};
  return labels[key] || key;
}

const docTypes: Record<string, { label: string; description: string }> = {
  cmnd: {
    label: "CMND/CCCD",
    description: "Chứng minh nhân dân/Căn cước công dân",
  },
  driver: {
    label: "Bằng lái xe",
    description: "Giấy phép lái xe",
  },
};

const UploadPage = () => {
  const { docType } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [frontImage, setFrontImage] = useState<string>("");
  const [backImage, setBackImage] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [side, setSide] = useState<"front"|"back">("front");
  const [showResult, setShowResult] = useState(false);
  const { isUploading, detectionResult, error: uploadError, uploadImage } = useUploadApi();
  const { isOcrProcessing, ocrResult, error: ocrError, processOcr } = useOcrApi();
  const { mrzError, mrzResult, checkMrz } = useMrzApi();

  const docInfo = docTypes[docType || ""] || {
    label: "Giấy tờ khác",
    description: "Upload giấy tờ tuỳ thân",
  };

  const handleUpload = async () => {
    if (!image) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ảnh giấy tờ để upload",
        variant: "destructive",
      });
      return;
    }
    await uploadImage(image, side);
    if (side === "front") setFrontImage(image);
    if (side === "back") setBackImage(image);
    setShowResult(true);
    if (uploadError) {
      toast({ title: "Lỗi upload", description: uploadError, variant: "destructive" });
    } else {
      toast({ title: "Upload thành công!", description: `${docInfo.label} đã được upload thành công.` });
    }
  };
  // OCR and MRZ handlers
  const handleOcrProcess = async (ocrApi: string) => {
    await processOcr(image, ocrApi);
    if (ocrError) {
      toast({ title: "Lỗi OCR", description: ocrError, variant: "destructive" });
    } else {
      toast({ title: "OCR thành công!", description: "Đã trích xuất thông tin từ giấy tờ." });
    }
  };

  const handleMrzCheck = async () => {
    await checkMrz(image);
    if (mrzError) {
      toast({ title: "Lỗi MRZ", description: mrzError, variant: "destructive" });
    } else {
      toast({ title: "MRZ hợp lệ!", description: "Đã kiểm tra MRZ thành công." });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/50 flex flex-col">
      <AppHeader />
      <div className="flex-1 flex items-center justify-center p-4">
        {!showResult ? (
          <CameraUploadSection
            side={side}
            setSide={setSide}
            image={image}
            setImage={setImage}
            isUploading={isUploading}
            handleUpload={handleUpload}
            docInfo={docInfo}
          />
        ) : (
          <ResultSection
            detectionResult={detectionResult}
            side={side}
            mrzError={mrzError}
            mrzResult={mrzResult}
            handleMrzCheck={handleMrzCheck}
            ocrResult={ocrResult}
            handleOcrProcess={handleOcrProcess}
            isOcrProcessing={isOcrProcessing}
            navigateHome={() => navigate("/")}
            onContinueBackSide={() => {
              setImage("");
              setShowResult(false);
              setSide("back");
            }}
            image={side === "back" ? backImage : frontImage}
            frontImage={frontImage}
            backImage={backImage}
          />
        )}
      </div>
      <AppFooter />
    </div>
  );
};

export default UploadPage;
