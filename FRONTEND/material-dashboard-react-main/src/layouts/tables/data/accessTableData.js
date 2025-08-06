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
        title: <Title title="화물카고 25톤미만 입차" />,
        titleText: "화물카고 25톤미만 입차",
        content: "화물카고 25톤미만 차량이 게이트 A로 입차하였습니다.",
        type: (
          <MDBox ml={-1}>
            <MDBadge badgeContent="입출입" color="info" variant="gradient" size="lg" />
          </MDBox>
        ),
        date: "25/07/18",
      },
      {
        listNum: <ListNum num="2" />,
        title: <Title title="덤프트럭 15톤 출차" />,
        titleText: "덤프트럭 15톤 출차",
        content: "덤프트럭 15톤 차량이 게이트 B로 출차하였습니다.",
        type: (
          <MDBox ml={-1}>
            <MDBadge badgeContent="입출입" color="info" variant="gradient" size="lg" />
          </MDBox>
        ),
        date: "25/07/15",
      },
    ],
  };
}
