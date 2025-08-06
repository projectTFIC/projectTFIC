/* eslint-disable react/prop-types */
/* eslint-disable react/function-component-definition */
/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";

export default function data() {
  const ListNum = ({ num, description }) => (
    <MDBox lineHeight={1} textAlign="left">
      <MDTypography display="block" variant="caption" fontWeight="medium" fontSize="17px">
        {num}
      </MDTypography>
      {description && <MDTypography variant="caption">{description}</MDTypography>}
    </MDBox>
  );

  const Title = ({ title, description }) => (
    <MDBox lineHeight={1} textAlign="left">
      <MDTypography display="block" variant="caption" fontWeight="medium" fontSize="15px">
        {title}
      </MDTypography>
      {description && <MDTypography variant="caption">{description}</MDTypography>}
    </MDBox>
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
        type: (
          <MDBox ml={-1}>
            <MDBadge badgeContent="입출입" color="primary" variant="gradient" size="lg" />
          </MDBox>
        ),
        date: (
          <MDTypography component="span" variant="caption" color="text" fontWeight="medium">
            25/07/18
          </MDTypography>
        ),
      },
      {
        listNum: <ListNum num="2" />,
        title: <Title title="덤프트럭 15톤 출차" />,
        type: (
          <MDBox ml={-1}>
            <MDBadge badgeContent="입출입" color="primary" variant="gradient" size="lg" />
          </MDBox>
        ),
        date: (
          <MDTypography component="span" variant="caption" color="text" fontWeight="medium">
            25/07/15
          </MDTypography>
        ),
      },
      {
        listNum: <ListNum num="3" />,
        title: <Title title="굴착기 7톤 입차" />,
        type: (
          <MDBox ml={-1}>
            <MDBadge badgeContent="입출입" color="primary" variant="gradient" size="lg" />
          </MDBox>
        ),
        date: (
          <MDTypography component="span" variant="caption" color="text" fontWeight="medium">
            25/07/12
          </MDTypography>
        ),
      },
      {
        listNum: <ListNum num="4" />,
        title: <Title title="지게차 출입 감지" />,
        type: (
          <MDBox ml={-1}>
            <MDBadge badgeContent="입출입" color="primary" variant="gradient" size="lg" />
          </MDBox>
        ),
        date: (
          <MDTypography component="span" variant="caption" color="text" fontWeight="medium">
            25/07/06
          </MDTypography>
        ),
      },
      {
        listNum: <ListNum num="5" />,
        title: <Title title="콘크리트 믹서 트럭 입차" />,
        type: (
          <MDBox ml={-1}>
            <MDBadge badgeContent="입출입" color="primary" variant="gradient" size="lg" />
          </MDBox>
        ),
        date: (
          <MDTypography component="span" variant="caption" color="text" fontWeight="medium">
            25/06/28
          </MDTypography>
        ),
      },
      {
        listNum: <ListNum num="6" />,
        title: <Title title="크레인 부속 출차" />,
        type: (
          <MDBox ml={-1}>
            <MDBadge badgeContent="입출입" color="primary" variant="gradient" size="lg" />
          </MDBox>
        ),
        date: (
          <MDTypography component="span" variant="caption" color="text" fontWeight="medium">
            25/06/21
          </MDTypography>
        ),
      },
      {
        listNum: <ListNum num="7" />,
        title: <Title title="롤러 3톤 입차" />,
        type: (
          <MDBox ml={-1}>
            <MDBadge badgeContent="입출입" color="primary" variant="gradient" size="lg" />
          </MDBox>
        ),
        date: (
          <MDTypography component="span" variant="caption" color="text" fontWeight="medium">
            25/06/19
          </MDTypography>
        ),
      },
      {
        listNum: <ListNum num="8" />,
        title: <Title title="덤프트럭 20톤 출차" />,
        type: (
          <MDBox ml={-1}>
            <MDBadge badgeContent="입출입" color="primary" variant="gradient" size="lg" />
          </MDBox>
        ),
        date: (
          <MDTypography component="span" variant="caption" color="text" fontWeight="medium">
            25/06/13
          </MDTypography>
        ),
      },
    ],
  };
}
