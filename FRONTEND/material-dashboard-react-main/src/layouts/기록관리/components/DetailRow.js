// src/components/DetailRow.js
import React from "react";
import PropTypes from "prop-types";
import { Box, Grid, Typography, Button, Tooltip } from "@mui/material";
import { motion } from "framer-motion";

function DetailRow({ row, showFullText, setShowFullText, handleOpen }) {
  if (!row) return null;

  const isLong = (row.report || row.content || "").length > 100;
  const fullShown = showFullText[row.rowId];
  const textToShow = fullShown
    ? row.report || row.content
    : (row.report || row.content || "").slice(0, 100) + (isLong ? "..." : "");

  return (
    <Box
      mt={3}
      px={3}
      py={2}
      borderRadius={3}
      sx={{
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(6px)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        border: "1px solid rgba(0,0,0,0.05)",
      }}
    >
      <Grid container spacing={3}>
        {row.originalImg || row.detectImg ? (
          <Grid item xs={12}>
            <Box
              display="flex"
              flexDirection={{ xs: "column", sm: "row" }}
              justifyContent="center"
              gap={2}
              flexWrap="wrap"
            >
              {["originalImg", "detectImg"].map((key) =>
                row[key] ? (
                  <Box
                    key={key}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpen(row[key]);
                    }}
                    sx={{
                      flex: "0 1 580px",
                      cursor: "pointer",
                      "& img": {
                        width: "100%",
                        borderRadius: 2,
                        boxShadow: 3,
                        transition: "transform 0.2s",
                        "&:hover": {
                          transform: "scale(1.01)",
                        },
                      },
                    }}
                  >
                    <Tooltip title="이미지를 클릭하면 확대됩니다" arrow>
                      <img src={row[key]} alt={key} />
                    </Tooltip>
                    <Typography
                      variant="body2"
                      align="center"
                      mt={1}
                      fontWeight="medium"
                      color="text.secondary"
                    >
                      {key === "originalImg" ? "원본 이미지" : "감지 이미지"}
                    </Typography>
                  </Box>
                ) : null
              )}
            </Box>
          </Grid>
        ) : null}

        <Grid item xs={12}>
          <Box
            p={2}
            borderRadius={2}
            bgcolor="#f0f4f8"
            sx={{ boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
          >
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              감지 위치
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {row.location || "정보 없음"}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box
            p={2}
            borderRadius={2}
            bgcolor="#f0f4f8"
            sx={{ boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
          >
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              감지 일자
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {row.date || "정보 없음"}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box
            p={3}
            borderRadius={2}
            bgcolor="#fffde7"
            sx={{
              boxShadow: "inset 0 1px 4px rgba(0,0,0,0.04)",
              maxHeight: 200,
              overflowY: "auto",
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" mb={1}>
              보고서 내용
            </Typography>
            {row.heNumber && (
              <Typography variant="body2" fontWeight="bold" color="Black" mb={1} fontSize={24}>
                차량 번호: {row.heNumber}
              </Typography>
            )}
            <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
              {textToShow}
            </Typography>
            {isLong && (
              <Box mt={1}>
                <Button
                  onClick={() => setShowFullText((prev) => ({ ...prev, [row.rowId]: !fullShown }))}
                  size="small"
                >
                  {fullShown ? "접기" : "더보기"}
                </Button>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

DetailRow.propTypes = {
  row: PropTypes.object.isRequired,
  showFullText: PropTypes.object.isRequired,
  setShowFullText: PropTypes.func.isRequired,
  handleOpen: PropTypes.func.isRequired,
};

export default DetailRow;
