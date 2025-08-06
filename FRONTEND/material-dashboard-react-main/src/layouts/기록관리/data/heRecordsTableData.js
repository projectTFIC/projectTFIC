/* eslint-disable react/prop-types */
// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";

// 토글 상세보기를 위한 컴포넌트들을 import 합니다.
import { Collapse, Card, CardContent, Grid } from "@mui/material";

// 이 함수는 서버에서 받은 데이터(records)를 테이블에 맞는 형식으로 변환합니다.
export default function heRecordTableData(records, expandedRowId, setExpandedRowId) {
  const handleRowClick = (recordId) => {
    setExpandedRowId(expandedRowId === recordId ? null : recordId);
  };

  const DetailView = ({ record }) => (
    <MDBox p={2}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <MDTypography variant="h6" fontWeight="medium">
            원본 캡처 이미지
          </MDTypography>
          <img
            src={record.originalImg}
            alt="Original Capture"
            style={{ width: "100%", borderRadius: "8px", marginTop: "8px" }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <MDTypography variant="h6" fontWeight="medium">
            객체 탐지 결과 이미지
          </MDTypography>
          <img
            src={record.detectImg}
            alt="Detection Result"
            style={{ width: "100%", borderRadius: "8px", marginTop: "8px" }}
          />
        </Grid>
        <Grid item xs={12}>
          <MDTypography variant="body2" color="text" mt={2}>
            {new Date(record.regDate).toLocaleString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            &nbsp;&nbsp;&nbsp;
            {record.heType}
            &nbsp;&nbsp;&nbsp;
            {record.heNumber}
            &nbsp;&nbsp;&nbsp;
            {record.access}
            &nbsp;&nbsp;&nbsp;
            {new Date(record.regDate).toLocaleTimeString("ko-KR")}
          </MDTypography>
        </Grid>
      </Grid>
    </MDBox>
  );

  return {
    columns: [
      { Header: "번호", accessor: "recordId", align: "center", width: "5%" },
      { Header: "제목", accessor: "recordTitle", align: "left" },
      { Header: "탐지유형", accessor: "detectionType", align: "center" },
      { Header: "날짜", accessor: "regDate", align: "center" },
    ],
    rows: records.flatMap((record) => [
      {
        recordId: (
          <MDTypography
            component="div"
            variant="caption"
            color="text"
            fontWeight="medium"
            sx={{ cursor: "pointer" }}
            onClick={() => handleRowClick(record.recordId)}
          >
            {record.recordId}
          </MDTypography>
        ),
        recordTitle: (
          <MDTypography
            component="div"
            variant="caption"
            color="text"
            fontWeight="medium"
            sx={{ cursor: "pointer" }}
            onClick={() => handleRowClick(record.recordId)}
          >
            {record.recordTitle}
          </MDTypography>
        ),
        detectionType: (
          <MDBox ml={-1}>
            <MDBadge
              badgeContent={record.detectionType}
              color="info"
              variant="gradient"
              size="sm"
            />
          </MDBox>
        ),
        regDate: (
          <MDTypography component="div" variant="caption" color="text" fontWeight="medium">
            {record.regDate}
          </MDTypography>
        ),
      },
      {
        isDetailRow: true,
        fullWidth: (
          <Collapse in={expandedRowId === record.recordId} timeout="auto" unmountOnExit>
            <Card variant="outlined" sx={{ m: 1, backgroundColor: "#f5f5f5" }}>
              <CardContent>
                <DetailView record={record} />
              </CardContent>
            </Card>
          </Collapse>
        ),
      },
    ]),
  };
}
