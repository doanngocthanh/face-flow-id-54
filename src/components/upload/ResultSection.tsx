// Helper to parse MRZ string for id and name
function parseMrz(mrzString: string) {
  // Tìm chuỗi số dài nhất trong MRZ làm id
  const digitMatches = mrzString.match(/\d{6,}/g);
  let id = "";
  if (digitMatches && digitMatches.length > 0) {
    id = digitMatches.reduce((a, b) => (b.length > a.length ? b : a), "");
  }
  // Tách tên: sau VNM... đến << (giữ nguyên logic cũ)
  const nameMatch = mrzString.match(/VNM\d{9}<<\d+[A-Z0-9]+([A-Z<]+)<<([A-Z<]+)/);
  let name = "";
  if (nameMatch) {
    name = (nameMatch[1] + " " + nameMatch[2]).replace(/</g, " ").replace(/\s+/g, " ").trim();
  }
  return { id, name };
}
import React from "react";
import { getDetectedFieldLabel } from "@/pages/UploadPage";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ResultSectionProps {
  detectionResult: any;
  side: "front" | "back";
  mrzError: string;
  mrzResult: any;
  handleMrzCheck: () => void;
  ocrResult: any;
  handleOcrProcess: (ocrApi: string) => void;
  isOcrProcessing: boolean;
  navigateHome: () => void;
  onContinueBackSide?: () => void;
  image?: string;
  frontImage?: string;
  backImage?: string;
}

const ResultSection: React.FC<ResultSectionProps> = ({
  detectionResult,
  side,
  mrzError,
  mrzResult,
  handleMrzCheck,
  ocrResult,
  handleOcrProcess,
  isOcrProcessing,
  navigateHome,
  onContinueBackSide,
  image,
  frontImage,
  backImage,
}) => (
  <Card className="w-full max-w-md gradient-card shadow-card border-border/50">
    <CardHeader className="text-center space-y-4">
      <CardTitle className="text-2xl font-bold text-foreground">Kết quả nhận diện</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* ...render detection, OCR, MRZ results here... */}
      {/* Hiển thị ảnh upload ở đầu kết quả */}
      {image && (
        <div className="flex flex-col items-center mb-4">
          <img src={image} alt="Ảnh giấy tờ đã upload" className="w-48 h-auto rounded shadow border" />
          <div className="text-xs text-muted-foreground text-center mt-1">Ảnh bạn đã upload</div>
        </div>
      )}
      {detectionResult ? (
        <div className="text-left space-y-2">
          {/* Detection details */}
          {detectionResult.detections && Array.isArray(detectionResult.detections) && detectionResult.detections.length > 0 ? (
            (() => {
              const det = detectionResult.detections[0];
              let ocrApi = "";
              if (det.detected_label === "cccd_new_front") ocrApi = "/api/v1/ocr/process/new_citizens_card_front";
              else if (det.detected_label === "cccd_new_back") ocrApi = "/api/v1/ocr/process/new_citizens_card_back";
              else if (det.detected_label === "citizens_card_front" || det.detected_label === "cccd_qr_front") ocrApi = "/api/v1/ocr/process/citizens_card_front";
              // ...add more mappings as needed

              // Kiểm tra mặt upload vs mặt nhận diện
              let detectedSide = "front";
              if (det.card_type?.name?.toLowerCase().includes("sau") || det.detected_label?.includes("back")) detectedSide = "back";
              if (det.card_type?.name?.toLowerCase().includes("trước") || det.detected_label?.includes("front")) detectedSide = "front";
              const sideMismatch = detectedSide !== side;

              // Hiển thị ảnh người dùng upload
              // (giả sử prop image truyền vào, nếu không thì cần truyền thêm)
              // ...existing code...

              return (
                <>
                  {sideMismatch && (
                    <div className="text-center text-destructive font-semibold p-4">
                      Bạn đã chọn upload mặt <span className="underline">{side === "front" ? "trước" : "sau"}</span> nhưng hệ thống nhận diện là mặt <span className="underline">{detectedSide === "front" ? "trước" : "sau"}</span>.<br />Vui lòng kiểm tra lại ảnh giấy tờ!
                    </div>
                  )}
                  {det.image_url && (
                    <div className="flex flex-col items-center mb-4">
                      <img src={det.image_url} alt="Ảnh giấy tờ đã upload" className="w-48 h-auto rounded shadow border" />
                      <div className="text-xs text-muted-foreground text-center mt-1">Ảnh bạn đã upload</div>
                    </div>
                  )}
                  <div><span className="font-semibold">Loại giấy tờ:</span> {det.card_category?.name || "Không xác định"}</div>
                  <div><span className="font-semibold">Mặt:</span> {det.card_type?.name || "Không xác định"}</div>
                  <div><span className="font-semibold">Độ tin cậy:</span> {(det.confidence * 100).toFixed(2)}%</div>
                  <div><span className="font-semibold">Hợp lệ:</span> {det.is_valid_card ? "Có" : "Không"}</div>
                  {det.ocr_features && (
                    <div className="space-y-1">
                      <div className="font-semibold">Đặc trưng OCR:</div>
                      <div className="grid grid-cols-2 gap-x-4 text-sm">
                        {Object.entries(det.ocr_features)
                          .filter(([key]) => key !== "detected_info_types")
                          .map(([key, val]) => (
                            <div key={key} className="flex items-center">
                              <span className="capitalize">{key}:</span>&nbsp;<span>{val ? "Có" : "Không"}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                  {det.ocr_features?.detected_info_types && Array.isArray(det.ocr_features.detected_info_types) && (
                    <div className="mt-2">
                      <div className="font-semibold">Các trường nhận diện được:</div>
                      <div className="flex flex-wrap gap-2">
                        {det.ocr_features.detected_info_types.map((info: string) => (
                          <span key={info} className="px-2 py-1 bg-primary/10 rounded text-sm">{info}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {ocrApi && (
                    <Button className="w-full mt-4" onClick={() => handleOcrProcess(ocrApi)} disabled={isOcrProcessing}>
                      {isOcrProcessing ? "Đang xử lý OCR..." : "Tiếp tục OCR"}
                    </Button>
                  )}
                </>
              );
            })()
          ) : (
            <div className="text-center">Không nhận diện được giấy tờ.</div>
          )}

          {/* OCR Result */}
          {ocrResult && (
            <div className="mt-4 p-2 border rounded bg-background/50">
              <div className="font-semibold mb-2">Kết quả OCR</div>
              <div className="flex flex-col gap-4 items-start mb-4">
                {ocrResult.image && (
                  <div className="flex-shrink-0 mx-auto">
                    <img
                      src={ocrResult.image}
                      alt="Ảnh giấy tờ đã upload"
                      className="w-48 h-auto rounded shadow border"
                    />
                    <div className="text-xs text-muted-foreground text-center mt-1">Ảnh bạn đã upload</div>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <div className="font-semibold mb-2 text-lg text-primary flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                  Bảng kết quả trích xuất
                </div>
                <div className="font-semibold text-xl text-foreground mb-1">{ocrResult.card_name || ocrResult.card_type}</div>
                <div className="text-sm text-muted-foreground mb-4">{ocrResult.card_type}</div>
                {/* Support both array and object result */}
                {Array.isArray(ocrResult.result?.ocr_results) && ocrResult.result.ocr_results.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(() => {
                      // ...existing array logic...
                      const importantKeys = ["id", "name", "full_name", "c_id", "c_full_name", "Số định danh", "Họ tên", "ID", "Name"];
                      const sortedFields = [...ocrResult.result.ocr_results].sort((a, b) => {
                        const aKey = (a.class_name || "").toLowerCase();
                        const bKey = (b.class_name || "").toLowerCase();
                        const aImportant = importantKeys.some(k => aKey.includes(k.toLowerCase()));
                        const bImportant = importantKeys.some(k => bKey.includes(k.toLowerCase()));
                        if (aImportant && !bImportant) return -1;
                        if (!aImportant && bImportant) return 1;
                        return 0;
                      });
                      return sortedFields.map((field: any, idx: number) => (
                        <div key={idx} className="rounded-lg border bg-background/80 p-3 shadow-card flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-primary/60"></span>
                            <span className="font-medium text-primary">{typeof getDetectedFieldLabel === 'function' ? getDetectedFieldLabel(field.class_name) : field.class_name}</span>
                          </div>
                          <div className={"text-base " + (field.text ? "text-foreground" : "italic text-muted-foreground")}>{field.text || "Không có dữ liệu"}</div>
                        </div>
                      ));
                    })()}
                  </div>
                ) : (
                  // If result is an object, render key-value pairs
                  ocrResult.result && typeof ocrResult.result === 'object' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(() => {
                        // Filter keys: only show string values
                        const importantKeys = ["id", "name", "full_name", "c_id", "c_full_name", "Số định danh", "Họ tên", "ID", "Name"];
                        const entries = Object.entries(ocrResult.result).filter(([k, v]) => typeof v === 'string');
                        // Sort important keys first
                        const sortedEntries = entries.sort(([k1], [k2]) => {
                          const aImportant = importantKeys.some(k => k1.toLowerCase().includes(k.toLowerCase()));
                          const bImportant = importantKeys.some(k => k2.toLowerCase().includes(k.toLowerCase()));
                          if (aImportant && !bImportant) return -1;
                          if (!aImportant && bImportant) return 1;
                          return 0;
                        });
                        return sortedEntries.map(([key, value], idx) => (
                          <div key={idx} className="rounded-lg border bg-background/80 p-3 shadow-card flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="inline-block w-2 h-2 rounded-full bg-primary/60"></span>
                              <span className="font-medium text-primary">{typeof getDetectedFieldLabel === 'function' ? getDetectedFieldLabel(key) : key}</span>
                            </div>
                            <div className={"text-base " + (value ? "text-foreground" : "italic text-muted-foreground")}>{typeof value === 'string' ? value : "Không có dữ liệu"}</div>
                          </div>
                        ));
                      })()}
                    </div>
                  ) : (
                    <div className="italic text-muted-foreground">Không có trường thông tin nào được trích xuất.</div>
                  )
                )}
              </div>
              {/* Nếu là mặt trước, hiển thị nút tiếp tục upload mặt sau */}
              {typeof onContinueBackSide === "function" && side === "front" && (
                <Button className="w-full mt-4" variant="secondary" onClick={onContinueBackSide}>
                  Tiếp tục upload mặt sau để kiểm tra MRZ
                </Button>
              )}
            </div>
          )}

          {/* MRZ Result & đối chiếu thông tin */}
          {side === "back" && (
            <Button className="w-full mt-2" variant="outline" onClick={handleMrzCheck}>
              Kiểm tra MRZ
            </Button>
          )}
          {mrzError && (
            <div className="text-destructive text-sm mt-2">{mrzError}</div>
          )}
          {mrzResult && mrzResult.mrz_string && (
            <div className="mt-4 p-2 border rounded bg-background/50">
              <div className="font-semibold mb-2">Kết quả MRZ</div>
              <div className="flex gap-4 mb-2">
                {(ocrResult?.image || frontImage) && (
                  <div className="flex flex-col items-center">
                    <img src={ocrResult?.image || frontImage} alt="Ảnh OCR" className="w-32 h-auto rounded shadow border" />
                    <div className="text-xs text-muted-foreground text-center mt-1">Ảnh OCR mặt trước</div>
                  </div>
                )}
                {(mrzResult?.image || backImage) && (
                  <div className="flex flex-col items-center">
                    <img src={mrzResult?.image || backImage} alt="Ảnh MRZ" className="w-32 h-auto rounded shadow border" />
                    <div className="text-xs text-muted-foreground text-center mt-1">Ảnh MRZ mặt sau</div>
                  </div>
                )}
              </div>
              <div className="text-base text-foreground break-words whitespace-pre-wrap" style={{ wordBreak: 'break-all' }}>{mrzResult.mrz_string}</div>
              {/* Đối chiếu với thông tin OCR mặt trước */}
              {ocrResult && (() => {
                // Tìm key id và name động
                let ocrId = "", ocrName = "";
                if (Array.isArray(ocrResult.result?.ocr_results)) {
                  ocrResult.result.ocr_results.forEach((field: any) => {
                    const key = (field.class_name || "").toLowerCase();
                    // Only take ID fields, not address/place
                    if (key.includes("id") && !key.includes("place") && !key.includes("address")) ocrId = field.text;
                    if (key.includes("name") || key.includes("full_name")) ocrName = field.text;
                  });
                }
                // Parse MRZ
                const { id: mrzId, name: mrzName } = parseMrz(mrzResult.mrz_string);
                // So sánh
                if (ocrId && mrzId) {
                  if (ocrId === mrzId) {
                    return <div className="flex items-center gap-2 text-green-600 font-semibold mt-2"><span className="bg-green-100 text-green-700 px-2 py-1 rounded">✔ Verified</span>ID trên MRZ (<b>{mrzId}</b>) khớp với ID trên mặt trước (<b>{ocrId}</b>)</div>;
                  }
                  // Nếu MRZ ID là một phần của OCR ID (trường hợp MRZ bị rút gọn)
                  if (ocrId.includes(mrzId)) {
                    return <div className="text-yellow-600 font-semibold mt-2">ID trên MRZ (<b>{mrzId}</b>) là một phần của ID trên mặt trước (<b>{ocrId}</b>)</div>;
                  }
                  // Nếu OCR ID là một phần của MRZ ID (trường hợp MRZ chứa nhiều số, OCR là số chính)
                  if (mrzId.includes(ocrId)) {
                    return <div className="text-yellow-600 font-semibold mt-2">ID trên mặt trước (<b>{ocrId}</b>) là một phần của ID trên MRZ (<b>{mrzId}</b>)</div>;
                  }
                  return <div className="text-destructive font-semibold mt-2">ID trên MRZ (<b>{mrzId}</b>) không liên quan đến ID trên mặt trước (<b>{ocrId}</b>).<br/>Cảnh báo: Bạn có thể đã upload dữ liệu của 2 người dùng khác nhau!</div>;
                }
                if (ocrName && mrzName && !mrzName.includes(ocrName.replace(/\s+/g, " ").toUpperCase())) {
                  return <div className="text-destructive font-semibold mt-2">Tên trên MRZ (<b>{mrzName}</b>) không khớp với tên trên mặt trước (<b>{ocrName}</b>)</div>;
                }
                if (ocrId && mrzId && ocrId === mrzId && ocrName && mrzName && mrzName.includes(ocrName.replace(/\s+/g, " ").toUpperCase())) {
                  return <div className="text-green-600 font-semibold mt-2">ID và tên trên MRZ khớp với mặt trước</div>;
                }
                return null;
              })()}
            </div>
          )}
          <Button className="w-full mt-2" variant="outline" onClick={navigateHome}>
            Về trang chủ
          </Button>
        </div>
      ) : (
        <div className="text-center">Không nhận diện được giấy tờ.</div>
      )}
    </CardContent>
  </Card>
);

export default ResultSection;
