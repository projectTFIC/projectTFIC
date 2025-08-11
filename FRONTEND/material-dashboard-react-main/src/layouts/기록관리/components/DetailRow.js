/* eslint-disable react/prop-types */
import React from "react";
import PropTypes from "prop-types";
import { Box, Card, CardContent, Typography } from "@mui/material";

function DetailRow({ row, onOpenImage }) {
  if (!row) return null;

  return (
    <Box display="flex" flexDirection="column" gap={2} p={1}>
      {/* 이미지 두 장 */}
      <Box display="flex" gap={2} flexWrap="wrap">
        {row.originalImg && (
          <Card
            sx={{ maxWidth: 420, cursor: "pointer", flex: "1 1 360px" }}
            onClick={(e) => {
              e.stopPropagation(); // 🔒 토글로 전파 방지
              onOpenImage?.(row.originalImg);
            }}
          >
            <CardContent>
              <Typography variant="body2" sx={{ mb: 1 }}>
                원본 이미지
              </Typography>
              <img
                src={row.originalImg}
                alt="original"
                style={{ width: "100%", height: "auto", objectFit: "contain" }}
              />
            </CardContent>
          </Card>
        )}

        {row.detectImg && (
          <Card
            sx={{ maxWidth: 420, cursor: "pointer", flex: "1 1 360px" }}
            onClick={(e) => {
              e.stopPropagation(); // 🔒 토글로 전파 방지
              onOpenImage?.(row.detectImg);
            }}
          >
            <CardContent>
              <Typography variant="body2" sx={{ mb: 1 }}>
                감지 이미지
              </Typography>
              <img
                src={row.detectImg}
                alt="detected"
                style={{ width: "100%", height: "auto", objectFit: "contain" }}
              />
            </CardContent>
          </Card>
        )}
      </Box>

      {/* 메타 정보 */}
      <Box display="flex" gap={2} flexWrap="wrap">
        <Card sx={{ flex: "1 1 260px" }}>
          <CardContent>
            <Typography variant="body2">감지 위치</Typography>
            <Typography variant="body1">{row.location || "정보 없음"}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: "1 1 260px" }}>
          <CardContent>
            <Typography variant="body2">감지 일자</Typography>
            <Typography variant="body1">{row.date || "정보 없음"}</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* 보고서 */}
      <Card>
        <CardContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            보고서 내용
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
            {row.report || row.content || "정보 없음"}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

DetailRow.propTypes = {
  onOpenImage: PropTypes.func,
  row: PropTypes.shape({
    originalImg: PropTypes.string,
    detectImg: PropTypes.string,
    location: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    date: PropTypes.string,
    report: PropTypes.string,
    content: PropTypes.string,
  }),
};

DetailRow.defaultProps = {
  onOpenImage: undefined,
  row: null,
};

export default DetailRow;
