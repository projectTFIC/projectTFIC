/* eslint-disable react/prop-types */
/* eslint-disable react/function-component-definition */
/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================
*/

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";

export default function data() {
  const ListNum = ({ num }) => (
    <MDBox lineHeight={1} textAlign="center">
      <MDTypography display="block" variant="caption" fontWeight="medium" fontSize="17px">
        {num}
      </MDTypography>
    </MDBox>
  );
  const Title = ({ title }) => (
    <MDBox lineHeight={1} textAlign="left">
      <MDTypography display="block" variant="caption" fontWeight="medium" fontSize="15px">
        {title}
      </MDTypography>
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
          <MDTypography component="span" variant="caption" color="text" fontWeight="medium">
            25/07/18
          </MDTypography>
        ),
        content: (
          <MDBox p={2}>
            <MDTypography>
              2025-07-18 14:22:00에 작업자 A씨의 위험 행동(안전모 미착용)이 감지되어 관리자에게
              알림이 전송되었습니다.
            </MDTypography>
          </MDBox>
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
          <MDTypography component="span" variant="caption" color="text" fontWeight="medium">
            25/07/15
          </MDTypography>
        ),
        content: (
          <MDBox p={2}>
            <MDTypography>
              2025-07-15 11:08:35에 작업자 B씨의 낙상이 감지되어 즉시 긴급 알림이 전송되었습니다.
            </MDTypography>
          </MDBox>
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
          <MDTypography component="span" variant="caption" color="text" fontWeight="medium">
            25/07/12
          </MDTypography>
        ),
        content: (
          <MDBox p={2}>
            <MDTypography>
              2025-07-12 16:40:12에 작업자 C씨가 지정된 작업 구역을 벗어나 위험 행동으로
              감지되었습니다.
            </MDTypography>
          </MDBox>
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
          <MDTypography component="span" variant="caption" color="text" fontWeight="medium">
            25/07/06
          </MDTypography>
        ),
        content: (
          <MDBox p={2}>
            <MDTypography>
              2025-07-06 09:30:45에 중장비와 작업자 D씨 사이의 끼임 위험이 감지되었습니다.
            </MDTypography>
          </MDBox>
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
          <MDTypography component="span" variant="caption" color="text" fontWeight="medium">
            25/06/28
          </MDTypography>
        ),
        content: (
          <MDBox p={2}>
            <MDTypography>
              2025-06-28 13:45:00에 중장비 이동 경로에서 작업자 E씨가 추돌 위험으로 감지되었습니다.
            </MDTypography>
          </MDBox>
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
          <MDTypography component="span" variant="caption" color="text" fontWeight="medium">
            25/06/21
          </MDTypography>
        ),
        content: (
          <MDBox p={2}>
            <MDTypography>
              2025-06-21 10:20:18에 작업자 F씨가 작업대에서 낙상이 감지되었습니다.
            </MDTypography>
          </MDBox>
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
          <MDTypography component="span" variant="caption" color="text" fontWeight="medium">
            25/06/19
          </MDTypography>
        ),
        content: (
          <MDBox p={2}>
            <MDTypography>
              2025-06-19 15:10:22에 작업자 G씨의 쓰러짐이 감지되어 비상 연락이 수행되었습니다.
            </MDTypography>
          </MDBox>
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
          <MDTypography component="span" variant="caption" color="text" fontWeight="medium">
            25/06/13
          </MDTypography>
        ),
        content: (
          <MDBox p={2}>
            <MDTypography>
              2025-06-13 08:55:04에 작업자 H씨의 쓰러짐 감지. 현장 관리자에게 경고 알림이
              발송되었습니다.
            </MDTypography>
          </MDBox>
        ),
      },
    ],
  };
}
