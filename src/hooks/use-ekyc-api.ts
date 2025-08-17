import { useState } from "react";

export function useUploadApi() {
  const [isUploading, setIsUploading] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [error, setError] = useState("");

  async function uploadImage(image: string, side: string) {
    setIsUploading(true);
    setError("");
    try {
      const formData = new FormData();
      let fileBlob, fileType, fileName;
      if (image.startsWith("data:image/")) {
        const matches = image.match(/^data:(image\/(png|jpeg|jpg));base64,(.*)$/);
        if (matches) {
          fileType = matches[1];
          fileName = `upload.${matches[2] === "jpeg" ? "jpg" : matches[2]}`;
          const byteString = atob(matches[3]);
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          fileBlob = new Blob([ab], { type: fileType });
        } else {
          throw new Error("Ảnh không hợp lệ");
        }
      } else {
        fileBlob = await fetch(image).then(res => res.blob());
        fileType = fileBlob.type || "image/jpeg";
        fileName = "upload.jpg";
      }
      formData.append("file", fileBlob, fileName);
      formData.append("side", side);
      const res = await fetch("/api/v1/card/detect", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setDetectionResult(data);
      } else {
        setError("Không thể nhận diện giấy tờ.");
      }
    } catch (e) {
      setError("Có lỗi xảy ra khi upload giấy tờ.");
    }
    setIsUploading(false);
  }

  return { isUploading, detectionResult, error, uploadImage };
}

export function useOcrApi() {
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [error, setError] = useState("");

  async function processOcr(image: string, ocrApi: string) {
    setIsOcrProcessing(true);
    setError("");
    try {
      const ocrForm = new FormData();
      let fileBlob, fileType, fileName;
      if (image.startsWith("data:image/")) {
        const matches = image.match(/^data:(image\/(png|jpeg|jpg));base64,(.*)$/);
        if (matches) {
          fileType = matches[1];
          fileName = `upload.${matches[2] === "jpeg" ? "jpg" : matches[2]}`;
          const byteString = atob(matches[3]);
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          fileBlob = new Blob([ab], { type: fileType });
        } else {
          throw new Error("Ảnh không hợp lệ");
        }
      } else {
        fileBlob = await fetch(image).then(res => res.blob());
        fileType = fileBlob.type || "image/jpeg";
        fileName = "upload.jpg";
      }
      ocrForm.append("file", fileBlob, fileName);
      const ocrRes = await fetch(ocrApi, {
        method: "POST",
        body: ocrForm,
      });
      if (ocrRes.ok) {
        const ocrData = await ocrRes.json();
        setOcrResult(ocrData);
      } else {
        setError("Không thể OCR giấy tờ.");
      }
    } catch (e) {
      setError("Có lỗi xảy ra khi OCR.");
    }
    setIsOcrProcessing(false);
  }

  return { isOcrProcessing, ocrResult, error, processOcr };
}

export function useMrzApi() {
  const [mrzError, setMrzError] = useState("");
  const [mrzResult, setMrzResult] = useState(null);

  async function checkMrz(image: string) {
    setMrzError("");
    try {
      const mrzForm = new FormData();
      let fileBlob, fileType, fileName;
      if (image.startsWith("data:image/")) {
        const matches = image.match(/^data:(image\/(png|jpeg|jpg));base64,(.*)$/);
        if (matches) {
          fileType = matches[1];
          fileName = `upload.${matches[2] === "jpeg" ? "jpg" : matches[2]}`;
          const byteString = atob(matches[3]);
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          fileBlob = new Blob([ab], { type: fileType });
        } else {
          throw new Error("Ảnh không hợp lệ");
        }
      } else {
        fileBlob = await fetch(image).then(res => res.blob());
        fileType = fileBlob.type || "image/jpeg";
        fileName = "upload.jpg";
      }
      mrzForm.append("file", fileBlob, fileName);
      const mrzRes = await fetch("/api/v1/mrz/ext", {
        method: "POST",
        body: mrzForm,
      });
      if (mrzRes.ok) {
        const mrzData = await mrzRes.json();
        setMrzResult(mrzData);
      } else {
        setMrzError("Không thể đọc MRZ từ ảnh giấy tờ này.");
      }
    } catch (e) {
      setMrzError("Có lỗi xảy ra khi kiểm tra MRZ.");
    }
  }

  return { mrzError, mrzResult, checkMrz };
}
