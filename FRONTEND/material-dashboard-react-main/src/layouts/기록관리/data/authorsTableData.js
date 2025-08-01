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
import MDAvatar from "components/MDAvatar";
import MDBadge from "components/MDBadge";

// Images
import team2 from "assets/images/team-2.jpg";
import team3 from "assets/images/team-3.jpg";
import team4 from "assets/images/team-4.jpg";

export default function data() {
  const ListNum = ({ num, description }) => (
    <MDBox lineHeight={1} textAlign="left">
      <MDTypography display="block" variant="caption" fontWeight="medium" fontSize="17px">
        {num}
      </MDTypography>
      <MDTypography variant="caption">{description}</MDTypography>
    </MDBox>
  );

  const Title = ({ title, description }) => (
    <MDBox lineHeight={1} textAlign="left">
      <MDTypography display="block" variant="caption" fontWeight="medium" fontSize="15px">
        {title}
      </MDTypography>
      <MDTypography variant="caption">{description}</MDTypography>
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
        title: <Title title="작업자 위험 행동 감지" />,
        type: (
          <MDBox ml={-1}>
            <MDBadge badgeContent="사고감지" color="error" variant="gradient" size="lg" />
          </MDBox>
        ),
        date: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            25/07/18
          </MDTypography>
        ),
      },
      {
        listNum: <ListNum num="2" />,
        title: <Title title="작업자 낙상 감지" />,
        type: (
          <MDBox ml={-1}>
            <MDBadge badgeContent="사고감지" color="error" variant="gradient" size="lg" />
          </MDBox>
        ),
        date: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            25/07/15
          </MDTypography>
        ),
      },
      {
        listNum: <ListNum num="3" />,
        title: <Title title="작업자 위험 행동 감지" />,
        type: (
          <MDBox ml={-1}>
            <MDBadge badgeContent="사고감지" color="error" variant="gradient" size="lg" />
          </MDBox>
        ),
        date: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            25/07/12
          </MDTypography>
        ),
      },
      {
        listNum: <ListNum num="4" />,
        title: <Title title="작업자 끼임 감지" />,
        type: (
          <MDBox ml={-1}>
            <MDBadge badgeContent="사고감지" color="error" variant="gradient" size="lg" />
          </MDBox>
        ),
        date: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            25/07/06
          </MDTypography>
        ),
      },
      {
        listNum: <ListNum num="5" />,
        title: <Title title="작업자 중장비 추돌 감지" />,
        type: (
          <MDBox ml={-1}>
            <MDBadge badgeContent="사고감지" color="error" variant="gradient" size="lg" />
          </MDBox>
        ),
        date: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            25/06/28
          </MDTypography>
        ),
      },
      {
        listNum: <ListNum num="6" />,
        title: <Title title="작업자 낙상 감지" />,
        type: (
          <MDBox ml={-1}>
            <MDBadge badgeContent="사고감지" color="error" variant="gradient" size="lg" />
          </MDBox>
        ),
        date: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            25/06/21
          </MDTypography>
        ),
      },
      {
        listNum: <ListNum num="7" />,
        title: <Title title="작업자 쓰러짐 감지" />,
        type: (
          <MDBox ml={-1}>
            <MDBadge badgeContent="사고감지" color="error" variant="gradient" size="lg" />
          </MDBox>
        ),
        date: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            25/06/19
          </MDTypography>
        ),
      },
      {
        listNum: <ListNum num="8" />,
        title: <Title title="작업자 쓰러짐 감지" />,
        type: (
          <MDBox ml={-1}>
            <MDBadge badgeContent="사고감지" color="error" variant="gradient" size="lg" />
          </MDBox>
        ),
        date: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            25/06/13
          </MDTypography>
        ),
      },
    ],
  };
}
