// Material Dashboard 2 React layouts
import Dashboard from "layouts/대시보드";
import 기록관리 from "layouts/기록관리";
import 모니터링 from "layouts/모니터링";
import Billing from "layouts/billing";
import Notifications from "layouts/notifications";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import Report from "layouts/보고서 생성";
import PrivateRoute from "components/PrivateRoute";
import { IconCategory, IconCamera, IconActivity } from "@tabler/icons-react";

import cctv from "layouts/img/cctv.png";
import 보고서 from "layouts/img/보고서3.png";
import 보고서생성 from "layouts/img/보고서생성4.png";
import 기록 from "layouts/img/기록2.png";
import 대시보드 from "layouts/img/대시보드2.png";
import 통계 from "layouts/img/차트.png";

// @mui icons
import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "collapse",
    name: "대시보드",
    key: "dashboard",
    icon: <img src={대시보드} alt="대시보드" style={{ width: 24, height: 24, marginRight: 9 }} />,
    route: "/dashboard",
    component: (
      <PrivateRoute>
        <Dashboard />
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
        <모니터링 />
      </PrivateRoute>
    ),
  },
  {
    type: "collapse",
    name: "기록관리",
    key: "tables",
    icon: <img src={기록} alt="기록" style={{ width: 24, height: 24, marginRight: 9 }} />,
    route: "/tables",
    component: (
      <PrivateRoute>
        <기록관리 />
      </PrivateRoute>
    ),
  },
  {
    type: "collapse",
    name: "보고서 게시판",
    key: "billing",
    icon: <img src={보고서} alt="보고서" style={{ width: 24, height: 24, marginRight: 9 }} />,
    route: "/billing",
    component: (
      <PrivateRoute>
        <Billing />
      </PrivateRoute>
    ),
  },
  {
    type: "collapse",
    name: "보고서 생성",
    key: "report",
    icon: (
      <img src={보고서생성} alt="보고서생성" style={{ width: 24, height: 24, marginRight: 9 }} />
    ),
    route: "/report",
    component: (
      <PrivateRoute>
        <Report />
      </PrivateRoute>
    ),
  },
  {
    type: "collapse",
    name: "통계",
    key: "notifications",
    icon: <img src={통계} alt="통계" style={{ width: 24, height: 24, marginRight: 9 }} />,
    route: "/notifications",
    component: (
      <PrivateRoute>
        <Notifications />
      </PrivateRoute>
    ),
  },
];

export default routes;
