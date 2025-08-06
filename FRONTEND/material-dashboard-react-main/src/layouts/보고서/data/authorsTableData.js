import axios from "axios";
import { useState, useEffect } from "react";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

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
          title: item.reportTitle, // 표시용
          author: item.name,
          date: new Date(item.regDate).toLocaleDateString("ko-KR").replace(/\./g, "/").slice(2, -1),
          reportFile: item.reportFile,
          originDate: item.regDate,
          // 토글에서 표시될 내용
          content: (
            <MDBox p={2}>
              <MDTypography variant="body2">
                {item.reportTitle} 보고서의 상세 내용입니다.
                <br />
                파일: {item.reportFile}
                <br />
                작성자: {item.name}
                <br />
                작성일: {new Date(item.regDate).toLocaleDateString("ko-KR").replace(/\./g, "/")}
              </MDTypography>
            </MDBox>
          ),
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
