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
          reportFile: item.reportFile, // 다운로드에 필요하므로 같이 포함
          originDate: item.regDate, // 필터링용 원본날짜
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
