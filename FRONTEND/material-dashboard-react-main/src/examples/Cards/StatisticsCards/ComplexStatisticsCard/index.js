// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function ComplexStatisticsCard({ color, title, count, percentage, icon, sx }) {
  // percentage.color 대신 amount 기준으로 계산
  const numericAmount = parseFloat((percentage?.amount || "").replace(/[^\d.-]/g, ""));
  const amountColor = numericAmount > 0 ? "error" : "info";

  return (
    <Card sx={sx}>
      <MDBox display="flex" alignItems="center" justifyContent="space-between" pt={1} px={2}>
        {/* 아이콘 박스 */}
        <MDBox
          variant="gradient"
          bgColor={color}
          color={color === "light" ? "dark" : "white"}
          coloredShadow={color}
          borderRadius="xl"
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="5rem"
          height="5rem"
          mt={-3}
        >
          {typeof icon === "string" ? (
            <Icon fontSize="medium" color="inherit">
              {icon}
            </Icon>
          ) : (
            icon
          )}
        </MDBox>

        {/* 제목 + 카운트 */}
        <MDBox ml={2}>
          <MDTypography variant="h4">{count}건</MDTypography>
          <MDTypography variant="button" sx={{ fontWeight: 400, fontSize: "18px" }}>
            {title}
          </MDTypography>
        </MDBox>

        {/* 우측 비워둠 */}
        <MDBox ml="auto" textAlign="right" />
      </MDBox>

      <Divider />

      <MDBox pb={2} px={2} display="flex" justifyContent="flex-end">
        <MDTypography component="p" variant="button" display="flex" alignItems="center" gap={1}>
          {/* 설명 텍스트 */}
          <MDTypography component="span" variant="button" fontWeight="light" color="text">
            {percentage.label}
          </MDTypography>

          {/* 수치 + 배경박스 */}
          <MDBox
            component="span"
            sx={{
              bgcolor:
                amountColor === "error" ? "rgba(211, 47, 47, 0.15)" : "rgba(2, 136, 209, 0.15)",
              color: amountColor === "error" ? "#d32f2f" : "#0288d1",
              fontWeight: "bold",
              fontSize: "14px",
              px: 1.2,
              py: 0.3,
              borderRadius: "6px",
              display: "inline-block",
              minWidth: "42px",
              textAlign: "center",
            }}
          >
            {percentage.amount}
          </MDBox>
        </MDTypography>
      </MDBox>
    </Card>
  );
}

// 기본값 설정
ComplexStatisticsCard.defaultProps = {
  color: "info",
  sx: {},
  percentage: {
    color: "success",
    amount: "",
    label: "",
  },
};

// prop-types
ComplexStatisticsCard.propTypes = {
  sx: PropTypes.object,
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "light",
    "dark",
  ]),
  title: PropTypes.string.isRequired,
  count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  percentage: PropTypes.shape({
    color: PropTypes.string,
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.string,
  }),
  icon: PropTypes.node.isRequired,
};

export default ComplexStatisticsCard;
