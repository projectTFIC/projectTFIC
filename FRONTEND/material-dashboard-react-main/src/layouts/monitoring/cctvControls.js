import { Card, Button, Grid } from "@mui/material";
import { Eye, Circle, Monitor } from "lucide-react";
import PropTypes from "prop-types";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";

export const CCTVControls = ({
  onAIDetection,
  onRecording,
  onAIView,
  isRecording = false,
  isAIDetectionActive = false,
  isAIViewActive = false,
}) => {
  return (
    <DashboardLayout>
      <Card style={{ padding: "16px", color: "black !important", height: "152px" }}>
        <Grid container spacing={2} alignItems="center" sx={{ height: "100%" }}>
          <Grid item xs={4}>
            <Button
              fullWidth
              variant={isAIDetectionActive ? "contained" : "outlined"}
              color="inherit"
              startIcon={<Eye />}
              onClick={onAIDetection}
              sx={{
                borderColor: "black",
                color: "black",
                backgroundColor: isAIDetectionActive ? "white" : "transparent",
                borderWidth: "1px",
                borderStyle: "solid",
                minHeight: 70,
                "&:hover": {
                  borderColor: "black",
                  backgroundColor: "rgba(0,0,0,0.1)",
                },
              }}
            >
              AI 실시간 탐지
            </Button>
          </Grid>

          <Grid item xs={4}>
            <Button
              fullWidth
              variant={isRecording ? "contained" : "outlined"}
              color="inherit"
              startIcon={
                <Circle
                  style={{ width: 16, height: 16 }}
                  className={isRecording ? "fill-current" : ""}
                />
              }
              onClick={onRecording}
              sx={{
                borderColor: "black",
                color: "black",
                backgroundColor: isRecording ? "white" : "transparent",
                borderWidth: "1px",
                borderStyle: "solid",
                minHeight: 70,
                "&:hover": {
                  borderColor: "black",
                  backgroundColor: "rgba(0,0,0,0.1)",
                },
              }}
            >
              {isRecording ? "녹화 중지" : "화면 녹화"}
            </Button>
          </Grid>

          <Grid item xs={4}>
            <Button
              fullWidth
              variant={isAIViewActive ? "contained" : "outlined"}
              color="inherit"
              startIcon={<Monitor />}
              onClick={onAIView}
              sx={{
                borderColor: "black",
                color: "black",
                backgroundColor: isAIViewActive ? "white" : "transparent",
                borderWidth: "1px",
                borderStyle: "solid",
                minHeight: 70,
                "&:hover": {
                  borderColor: "black",
                  backgroundColor: "rgba(0,0,0,0.1)",
                },
              }}
            >
              AI탐지화면 전환
            </Button>
          </Grid>
        </Grid>
      </Card>
    </DashboardLayout>
  );
};

CCTVControls.propTypes = {
  onAIDetection: PropTypes.func,
  onRecording: PropTypes.func,
  onAIView: PropTypes.func,
  isRecording: PropTypes.bool,
  isAIDetectionActive: PropTypes.bool,
  isAIViewActive: PropTypes.bool,
};

export default CCTVControls;
