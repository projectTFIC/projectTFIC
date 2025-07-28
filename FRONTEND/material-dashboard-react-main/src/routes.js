// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
<<<<<<< HEAD
import Tables2 from "layouts/기록관리";
=======
import Monitoring from "layouts/monitoring/monitoring.js";
>>>>>>> ff20b47 (프론트 작업 추가)
import Billing from "layouts/billing";
import RTL from "layouts/rtl";
import Notifications from "layouts/notifications";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";

// @mui icons
import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "collapse",
    name: "대시보드",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "기록관리",
    key: "tables",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/tables",
    component: <Tables />,
  },
  {
    type: "collapse",
    name: "보고서 생성",
    key: "billing",
    icon: <Icon fontSize="small">receipt_long</Icon>,
    route: "/billing",
    component: <Billing />,
  },
  {
    type: "collapse",
<<<<<<< HEAD
    name: "RTL",
    key: "rtl",
    icon: <Icon fontSize="small">format_textdirection_r_to_l</Icon>,
    route: "/rtl",
    component: <RTL />,
  },
  {
    type: "collapse",
    name: "알림",
=======
    name: "모니터링",
    key: "monitoring",
    icon: <Icon fontSize="small">format_textdirection_r_to_l</Icon>,
    route: "/monitoring",
    component: <Monitoring />,
  },
  {
    type: "collapse",
    name: "Notifications",
>>>>>>> ff20b47 (프론트 작업 추가)
    key: "notifications",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/notifications",
    component: <Notifications />,
  },
  {
    type: "collapse",
<<<<<<< HEAD
    name: "프로필",
=======
    name: "Profile",
>>>>>>> ff20b47 (프론트 작업 추가)
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: <Profile />,
  },
  {
    type: "collapse",
<<<<<<< HEAD
    name: "로그인",
=======
    name: "Sign In",
>>>>>>> ff20b47 (프론트 작업 추가)
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
  {
    type: "collapse",
<<<<<<< HEAD
    name: "회원가입",
=======
    name: "Sign Up",
>>>>>>> ff20b47 (프론트 작업 추가)
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/sign-up",
    component: <SignUp />,
  },
];

export default routes;
