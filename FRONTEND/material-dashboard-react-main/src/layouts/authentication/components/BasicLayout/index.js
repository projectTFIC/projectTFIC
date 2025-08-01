// File: src/layouts/authentication/components/BasicLayout.js

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

import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";

function BasicLayout({ image, children }) {
  return (
    <MDBox
      minHeight="100vh"
      width="100%"
      sx={{
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Grid
        container
        spacing={0}
        alignItems="center"
        justifyContent="center"
        sx={{ minHeight: "100vh" }}
      >
        {/* 좌우 공백을 줄이기 위해 md 이상일 때 12 그리드 중 8 사용 */}
        <Grid item xs={11} sm={9} md={8} lg={7} xl={6}>
          {children}
        </Grid>
      </Grid>
    </MDBox>
  );
}

BasicLayout.propTypes = {
  image: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default BasicLayout;
