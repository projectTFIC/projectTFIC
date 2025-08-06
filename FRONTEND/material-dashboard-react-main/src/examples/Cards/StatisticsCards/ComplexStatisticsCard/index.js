// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function ComplexStatisticsCard({ color, title, count, percentage, icon, comparison, sx }) {
  const numericAmount = parseFloat((percentage?.amount || "").replace(/[^\d.-]/g, ""));
  const amountColor = numericAmount > 0 ? "error" : "info";

  return (
    <Card sx={sx}>
      {/* 상단 */}
      <MDBox display="flex" alignItems="center" justifyContent="space-between" pt={1} px={2}>
        {/* 아이콘 */}
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

        {/* 중앙: 제목 + 수치 + 어제대비 */}
        <MDBox ml={2} flex={1} display="flex" alignItems="center" justifyContent="flex-start">
          {/* 왼쪽: 수치와 제목 */}
          <MDBox>
            <MDTypography variant="h4">{count}건</MDTypography>
            <MDTypography variant="button" sx={{ fontWeight: 400, fontSize: "18px" }}>
              {title}
            </MDTypography>
          </MDBox>

          {/* 오른쪽 중앙: 비교 수치 박스 */}
          {comparison && (
            <MDBox display="flex" alignItems="center" ml={2}>
              <MDTypography
                variant="button"
                sx={{ fontWeight: "light", color: "text.secondary", fontSize: "14px", mr: 1 }}
              >
                {comparison.label}
              </MDTypography>
              <MDBox
                component="span"
                sx={{
                  bgcolor: "rgba(56, 142, 60, 0.15)",
                  color: "#388e3c",
                  fontWeight: "bold",
                  fontSize: "14px",
                  px: 1.2,
                  py: 0.3,
                  borderRadius: "6px",
                  minWidth: "42px",
                  textAlign: "center",
                }}
              >
                {comparison.amount}
              </MDBox>
            </MDBox>
          )}
        </MDBox>
      </MDBox>

      <Divider />

      {/* 하단: 지난주 대비 +10% */}
      <MDBox pb={2} px={2} display="flex" justifyContent="flex-end">
        <MDTypography component="p" variant="button" display="flex" alignItems="center" gap={1}>
          <MDTypography component="span" variant="button" fontWeight="light" color="text">
            {percentage.label}
          </MDTypography>

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
  comparison: null,
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
  comparison: PropTypes.shape({
    label: PropTypes.string,
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  icon: PropTypes.node.isRequired,
};

export default ComplexStatisticsCard;
