import React from "react";
import PropTypes from "prop-types";
import { Card, CardContent, Typography, Grid, Button, Divider, Box } from "@mui/material";
import MDBadge from "components/MDBadge";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";

export const CCTVList = ({ cameras, activeCameraId, onCameraSelect }) => {
  return (
    <Box
      sx={{
        height: "calc(100vh - 64px)",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Card
        sx={{
          flexGrow: 1,
          p: 2,
          boxShadow: 4,
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
        }}
      >
        <CardContent
          sx={{ flexGrow: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}
        >
          {/* 헤더 */}
          <Box mb={2}>
            <Typography variant="h6" gutterBottom color="text.primary">
              영상장비 리스트
            </Typography>
            <Typography variant="body2" color="text.secondary">
              DB 내 영상장비 디바이스 목록
            </Typography>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* 컬럼 헤더 */}
          <Grid container spacing={1} sx={{ mb: 1 }} fontWeight="bold" fontSize={13}>
            <Grid item xs={3}>
              장비 번호
            </Grid>
            <Grid item xs={5}>
              장비 이름
            </Grid>
            <Grid item xs={4} textAlign="right">
              위치
            </Grid>
          </Grid>

          {/* 카메라 리스트 */}
          <Box display="flex" flexDirection="column" gap={1} flexGrow={1} overflow="auto">
            {cameras.map((camera) => {
              const isActive = camera.id === activeCameraId;
              return (
                <Button
                  key={camera.id}
                  variant={isActive ? "contained" : "outlined"}
                  color={isActive ? "primary" : "inherit"}
                  sx={{
                    justifyContent: "space-between",
                    alignItems: "center",
                    textAlign: "left",
                    padding: 1.5,
                    borderRadius: 2,
                    boxShadow: isActive ? 3 : 0,
                  }}
                  onClick={() => onCameraSelect(camera.id)}
                >
                  {/* 왼쪽: 상태 + 정보 */}
                  <Box display="flex" alignItems="center" gap={2}>
                    <MDBadge
                      variant="gradient"
                      color={camera.status === "online" ? "success" : "error"}
                      size="xs"
                      badgeContent={camera.status === "online" ? "Online" : "Offline"}
                    />
                    <Box>
                      <Typography variant="subtitle2">{camera.id}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {camera.name}
                      </Typography>
                    </Box>
                  </Box>

                  {/* 오른쪽: 위치 */}
                  <Typography variant="body2" color="text.secondary">
                    {camera.location}
                  </Typography>
                </Button>
              );
            })}
          </Box>

          {/* 하단 설명 */}
          <Divider sx={{ mt: 3, mb: 1 }} />
          <Box mt={1}>
            <Typography variant="caption" color="text.secondary" component="div">
              • 클릭하여 카메라 전환
              <br />• 실시간 상태 모니터링
              <br />• 자동 연결 상태 확인
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

CCTVList.propTypes = {
  cameras: PropTypes.array.isRequired,
  activeCameraId: PropTypes.string.isRequired,
  onCameraSelect: PropTypes.func.isRequired,
};

export default CCTVList;
