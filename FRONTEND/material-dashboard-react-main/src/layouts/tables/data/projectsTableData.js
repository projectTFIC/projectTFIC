/* eslint-disable react/prop-types */
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";

export default function data() {
  const ListNum = ({ num }) => (
    <MDTypography variant="caption" fontWeight="medium" fontSize="17px">
      {num}
    </MDTypography>
  );

  const Title = ({ title }) => (
    <MDTypography variant="caption" fontWeight="medium" fontSize="15px" color="black">
      {title}
    </MDTypography>
  );

  return {
    columns: [
      { Header: "No.", accessor: "listNum", align: "center" },
      { Header: "제목", accessor: "title", width: "50%", align: "center" },
      { Header: "유형", accessor: "type", align: "center" },
      { Header: "날짜", accessor: "date", align: "center" },
    ],
    rows: [
      {
        listNum: <ListNum num="1" />,
        title: <Title title="작업자 안전화 미착용" />,
        titleText: "작업자 안전화 미착용",
        content: "작업자가 안전화를 착용하지 않은 것이 감지되었습니다.",
        type: (
          <MDBox ml={-1}>
            <MDBadge badgeContent="안전장비 감지" color="warning" variant="gradient" size="lg" />
          </MDBox>
        ),
        date: "25/07/18",
      },
      {
        listNum: <ListNum num="2" />,
        title: <Title title="작업자 헬멧 미착용" />,
        titleText: "작업자 헬멧 미착용",
        content: "작업자가 헬멧을 착용하지 않은 것이 감지되었습니다.",
        type: (
          <MDBox ml={-1}>
            <MDBadge badgeContent="안전장비 감지" color="warning" variant="gradient" size="lg" />
          </MDBox>
        ),
        date: "25/07/15",
      },
    ],
  };
}
