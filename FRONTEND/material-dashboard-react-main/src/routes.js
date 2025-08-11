// Material Dashboard 2 React layouts
import DashBoard from "layouts/대시보드";
import LogManagement from "layouts/기록관리";
import Monitoring from "layouts/모니터링";
import Report from "layouts/보고서";
import Statistics from "layouts/통계";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import CreateReport from "layouts/보고서 생성";
import PrivateRoute from "components/PrivateRoute";

import cctv from "layouts/img/cctv.png";
import 보고서 from "layouts/img/보고서3.png";
import 보고서생성 from "layouts/img/보고서생성4.png";
import 기록 from "layouts/img/기록2.png";
import 대시보드 from "layouts/img/대시보드2.png";
import 차트 from "layouts/img/차트.png";

const routes = [
  {
    type: "collapse",
    name: "대시보드",
    key: "dashboard",
    icon: <img src={대시보드} alt="대시보드" style={{ width: 24, height: 24, marginRight: 9 }} />,
    route: "/dashboard",
    component: (
      <PrivateRoute>
        <DashBoard />,
      </PrivateRoute>
    ),
  },
  {
    type: "collapse",
    name: "모니터링",
    key: "monitoring",
    icon: <img src={cctv} alt="cctv" style={{ width: 23, height: 23, marginRight: 9 }} />,
    route: "/monitoring",
    component: (
      <PrivateRoute>
        <Monitoring />,
      </PrivateRoute>
    ),
  },
  {
    type: "collapse",
    name: "기록관리",
    key: "log-management",
    icon: <img src={기록} alt="기록" style={{ width: 24, height: 24, marginRight: 9 }} />,
    route: "/log-management",
    component: (
      <PrivateRoute>
        <LogManagement />,
      </PrivateRoute>
    ),
  },
  {
    type: "collapse",
    name: "보고서 게시판",
    key: "report",
    icon: <img src={보고서} alt="보고서" style={{ width: 24, height: 24, marginRight: 9 }} />,
    route: "/report",
    component: (
      <PrivateRoute>
        <Report />,
      </PrivateRoute>
    ),
  },
  {
    type: "collapse",
    name: "보고서 생성",
    key: "create-report",
    icon: (
      <img src={보고서생성} alt="보고서생성" style={{ width: 24, height: 24, marginRight: 9 }} />
    ),
    route: "/create-report",
    component: (
      <PrivateRoute>
        <CreateReport />,
      </PrivateRoute>
    ),
  },
  {
    type: "collapse",
    name: "통계",
    key: "statistics",
    icon: <img src={차트} alt="통계" style={{ width: 24, height: 24, marginRight: 9 }} />,
    route: "/statistics",
    component: (
      <PrivateRoute>
        <Statistics />,
      </PrivateRoute>
    ),
  },
  {
    key: "sign-in",
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
];

export default routes;
