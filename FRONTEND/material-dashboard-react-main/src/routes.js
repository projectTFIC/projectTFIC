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

// @mui icons
import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "collapse",
    name: "대시보드",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <PrivateRoute><Dashboard /></PrivateRoute>,
  },
  {
    type: "collapse",
    name: "모니터링",
    key: "monitoring",
    icon: <Icon fontSize="small">format_textdirection_r_to_l</Icon>,
    route: "/monitoring",
    component: <PrivateRoute><모니터링 /></PrivateRoute>,
  },
  {
    type: "collapse",
    name: "기록관리",
    key: "tables",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/tables",
    component: <PrivateRoute><기록관리 /></PrivateRoute>,
  },
  {
    type: "collapse",
    name: "보고서 게시판",
    key: "billing",
    icon: <Icon fontSize="small">receipt_long</Icon>,
    route: "/billing",
    component: <PrivateRoute><Billing /></PrivateRoute>,
  },
  {
    type: "collapse",
    name: "보고서 생성",
    key: "report",
    icon: <Icon fontSize="small">receipt_long</Icon>,
    route: "/report",
    component: <PrivateRoute><Report /></PrivateRoute>,
  },
  {
    type: "collapse",
    name: "통계",
    key: "notifications",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/notifications",
    component: <PrivateRoute><Notifications /></PrivateRoute>,
  },
  {
    type: "collapse",
    name: "프로필",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: <PrivateRoute><Profile /></PrivateRoute>,
  },
  {
    type: "collapse",
    name: "로그인",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
  {
    type: "collapse",
    name: "회원가입",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/sign-up",
    component: <SignUp />,
  },
];

export default routes;
