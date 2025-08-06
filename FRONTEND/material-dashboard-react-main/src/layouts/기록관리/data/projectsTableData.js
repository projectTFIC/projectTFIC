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
        title: <Title title="작업자 안전화 미착용" />,
        type: (
          <MDBox ml={-1}>
            <MDBadge badgeContent="안전장비 감지" color="warning" variant="gradient" size="lg" />
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
              2025-07-18 07:45:00에 작업자 A씨가 안전화를 착용하지 않고 현장에 입장함이
              감지되었습니다.
            </MDTypography>
          </MDBox>
        ),
      },
      {
        listNum: <ListNum num="2" />,
        title: <Title title="작업자 헬멧 미착용" />,
        type: (
          <MDBox ml={-1}>
            <MDBadge badgeContent="안전장비 감지" color="warning" variant="gradient" size="lg" />
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
              2025-07-15 12:30:15에 작업자 B씨가 헬멧 미착용 상태로 작업 중인 것이 감지되었습니다.
            </MDTypography>
          </MDBox>
        ),
      },
      {
        listNum: <ListNum num="3" />,
        title: <Title title="작업자 헬멧 미착용" />,
        type: (
          <MDBox ml={-1}>
            <MDBadge badgeContent="안전장비 감지" color="warning" variant="gradient" size="lg" />
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
              2025-07-12 09:20:10에 작업자 C씨의 헬멧 미착용이 감지되었습니다.
            </MDTypography>
          </MDBox>
        ),
      },
      {
        listNum: <ListNum num="4" />,
        title: <Title title="작업자 보호조끼 미착용" />,
        type: (
          <MDBox ml={-1}>
            <MDBadge badgeContent="안전장비 감지" color="warning" variant="gradient" size="lg" />
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
              2025-07-06 14:05:55에 작업자 D씨가 보호조끼를 착용하지 않아 경고 알림이
              전송되었습니다.
            </MDTypography>
          </MDBox>
        ),
      },
      {
        listNum: <ListNum num="5" />,
        title: <Title title="작업자 안전화 미착용" />,
        type: (
          <MDBox ml={-1}>
            <MDBadge badgeContent="안전장비 감지" color="warning" variant="gradient" size="lg" />
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
              2025-06-28 08:15:30에 작업자 E씨의 안전화 미착용이 감지되었습니다.
            </MDTypography>
          </MDBox>
        ),
      },
      {
        listNum: <ListNum num="6" />,
        title: <Title title="작업자 보호조끼 미착용" />,
        type: (
          <MDBox ml={-1}>
            <MDBadge badgeContent="안전장비 감지" color="warning" variant="gradient" size="lg" />
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
              2025-06-21 10:00:00에 작업자 F씨가 보호조끼를 착용하지 않은 상태가 감지되었습니다.
            </MDTypography>
          </MDBox>
        ),
      },
      {
        listNum: <ListNum num="7" />,
        title: <Title title="작업자 헬멧 미착용" />,
        type: (
          <MDBox ml={-1}>
            <MDBadge badgeContent="안전장비 감지" color="warning" variant="gradient" size="lg" />
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
              2025-06-19 16:25:45에 작업자 G씨가 헬멧 없이 출입하였음이 감지되었습니다.
            </MDTypography>
          </MDBox>
        ),
      },
      {
        listNum: <ListNum num="8" />,
        title: <Title title="작업자 헬멧 미착용" />,
        type: (
          <MDBox ml={-1}>
            <MDBadge badgeContent="안전장비 감지" color="warning" variant="gradient" size="lg" />
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
              2025-06-13 07:50:30에 작업자 H씨의 헬멧 미착용이 반복적으로 감지되었습니다.
            </MDTypography>
          </MDBox>
        ),
      },
    ],
  };
}
