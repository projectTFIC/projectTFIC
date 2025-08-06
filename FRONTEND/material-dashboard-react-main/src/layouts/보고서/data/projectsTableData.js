// src/layouts/billing/data/projectsTableData.js
import axios from "axios";
import { useState, useEffect } from "react";

export default function useProjectsTableData(startDate, endDate) {
  const [columns] = useState([
    { Header: "NO.", accessor: "no", align: "center" },
    { Header: "제목", accessor: "title", align: "left" },
    { Header: "작성자", accessor: "author", align: "center" },
    { Header: "날짜", accessor: "date", align: "center" },
  ]);

  const [rows, setRows] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        let url = "http://localhost:8090/web/reportlist";
        if (startDate && endDate) {
          url += `/search?start=${startDate}&end=${endDate}`;
        }
        const res = await axios.get(url);

        const data = res.data.map((item, idx) => ({
          no: idx + 1,
          title: item.reportTitle,
          author: item.name,
          date: new Date(item.regDate).toLocaleDateString("ko-KR").replace(/\./g, "/").slice(2, -1),
          reportFile: item.reportFile,
          originDate: item.regDate,
          // 토글로 보여줄 내용 (백엔드에 내용 필드 없으면 임시 문구)
          content: item.reportContent
            ? item.reportContent
            : `${item.reportTitle} 보고서 내용이 없습니다.`,
        }));

        setRows(data);
      } catch (error) {
        console.error("보고서 데이터를 불러오는 중 오류:", error);
      }
    };

    fetchReports();
  }, [startDate, endDate]);

  return { columns, rows };
}
