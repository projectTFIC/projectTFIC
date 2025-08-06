import React from "react";
import PropTypes from "prop-types";
import html2pdf from "html2pdf.js";

function DownloadPdfButton({ reportHtml, reportType }) {
  const handleDownload = () => {
    // 1. 임시 div 생성해서 HTML 붙여넣기
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = reportHtml;
    tempDiv.style.padding = "20px"; // PDF 여백 확보
    document.body.appendChild(tempDiv); // DOM에 추가

    // 2. html2pdf 옵션 설정 및 PDF 변환
    html2pdf()
      .from(tempDiv)
      .set({
        margin: 1,
        filename: `${reportType}_report.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "cm", format: "a4", orientation: "portrait" },
      })
      .save()
      .finally(() => {
        // 3. 끝나면 tempDiv 제거
        document.body.removeChild(tempDiv);
      });
  };

  return <button onClick={handleDownload}>PDF 다운로드</button>;
}

DownloadPdfButton.propTypes = {
  reportHtml: PropTypes.string.isRequired,
  reportType: PropTypes.string.isRequired,
};

export default DownloadPdfButton;
