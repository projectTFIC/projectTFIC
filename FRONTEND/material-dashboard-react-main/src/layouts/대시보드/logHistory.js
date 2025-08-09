// src/layouts/대시보드/logHistory.js

import React, { useEffect, useState } from "react";
import axios from "axios";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Slide from "@mui/material/Slide";

import 사고감지 from "layouts/img/비상벨.png";
import 미착용감지 from "layouts/img/미착용감지3.png";
import 입출입감지 from "layouts/img/체크표시(그린)2.png";

import { io } from "socket.io-client";
import api from "../../api/client";

function LogHistory() {
  const [logItems, setLogItems] = useState([]);

  // 1. 최초에 DB 로그 불러오기
  useEffect(() => {
    api
      .get("/tablelist/logs") // 결국 https://LB도메인/web/tablelist/logs 로 전달
      .then((res) => Array.isArray(res.data) && setLogItems(res.data))
      .catch((err) => console.error("로그 초기 로드 실패:", err));
  }, []);

  // 2. 실시간 알람(WebSocket) 수신
  useEffect(() => {
    const useSocket = true; // 🔹 이 값을 true/false로 전환해 사용

    if (useSocket) {
      import("../../socket").then(({ default: socket }) => {
        socket.connect();
        socket.on("connect", () => console.log("Socket connected"));
        socket.on("realtime-log", (newLog) => {
          setLogItems((prev) => [newLog, ...prev.slice(0, 49)]);
        });
        socket.on("disconnect", () => console.log("Socket disconnected"));
      });
    } else {
      const id = setInterval(async () => {
        try {
          const { data } = await api.get("/tablelist/logs");
          Array.isArray(data) && setLogItems(data);
        } catch (e) {
          console.warn("폴링 실패:", e.message);
        }
      }, 3000);

      return () => clearInterval(id);
    }
  }, []);

  // 3. 카테고리별 아이콘, 배경색, 기본 라벨 분기함수 (category 기준)
  const getIconAndColor = (category) => {
    switch (category) {
      case "accident":
        return {
          bgColor: "rgba(220,0,0,0.1)",
          iconSrc: 사고감지,
          label: "사고 감지",
        };
      case "equipment-access":
        return {
          bgColor: "rgba(0,180,0,0.1)",
          iconSrc: 입출입감지,
          label: "입출입 감지",
        };
      case "safety-violation":
        return {
          bgColor: "rgba(255,140,0,0.15)",
          iconSrc: 미착용감지,
          label: "미착용 감지",
        };
      default:
        return {
          bgColor: "#f0f0f0",
          iconSrc: null,
          label: "감지",
        };
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        borderRadius: "8px",
        background: "linear-gradient(135deg, #f9fafe, #e9ecf5)",
        height: 535,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box display="flex" alignItems="center" mb={2}>
        <Typography variant="h6" sx={{ color: "black", fontWeight: 600, fontSize: "1rem" }}>
          로그 기록
        </Typography>
      </Box>
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        <Stack spacing={1}>
          {logItems.map((log) => {
            const { bgColor, iconSrc, label: defaultLabel } = getIconAndColor(log.category);
            const labelToDisplay = log.label || defaultLabel;
            const isAccident = log.category === "accident";

            return (
              <Slide
                key={log.id ?? log.time}
                direction="right"
                in
                mountOnEnter
                unmountOnExit
                timeout={600}
              >
                <Box>
                  <Box display="flex" justifyContent={isAccident ? "flex-end" : "flex-start"}>
                    <Box
                      display="flex"
                      alignItems="flex-start"
                      justifyContent="space-between"
                      sx={{
                        backgroundColor: bgColor,
                        borderRadius: "10px",
                        p: 1.2,
                        width: "68%",
                        maxWidth: 460,
                      }}
                    >
                      <Box mt={0.2} mr={1}>
                        {iconSrc && (
                          <img
                            src={iconSrc}
                            alt={`${labelToDisplay} 아이콘`}
                            style={{ width: 29, height: 26, display: "block" }}
                          />
                        )}
                      </Box>
                      <Box flex={1}>
                        <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#333" }}>
                          {labelToDisplay}
                        </Typography>
                        <Typography sx={{ fontSize: "0.7rem", color: "#555", mt: 0.3 }}>
                          {log.message || "객체 감지 시스템에서 새로운 이벤트가 감지되었습니다"}
                        </Typography>
                        <Box display="flex" gap={0.8} mt={0.8}>
                          <Chip
                            label={log.chipValue || "-"}
                            size="small"
                            sx={{
                              backgroundColor:
                                log.category === "accident"
                                  ? "rgba(211, 47, 47, 0.1)"
                                  : log.category === "safety-violation"
                                  ? "rgba(245, 124, 0, 0.1)"
                                  : "rgba(56, 142, 60, 0.1)",
                              border: `1px solid ${
                                log.category === "accident"
                                  ? "#d32f2f"
                                  : log.category === "safety-violation"
                                  ? "#f57c00"
                                  : "#388e3c"
                              }`,
                              color:
                                log.category === "accident"
                                  ? "#d32f2f"
                                  : log.category === "safety-violation"
                                  ? "#f57c00"
                                  : "#388e3c",
                              height: 20,
                              fontSize: "0.65rem",
                              fontWeight: 500,
                              borderRadius: "10px",
                              px: 1,
                            }}
                          />
                          <Chip
                            label={log.name || "-"}
                            size="small"
                            sx={{
                              backgroundColor: "rgba(255,255,255,0.4)",
                              border: "1px solid #ccc",
                              color: "#555",
                              height: 20,
                              fontSize: "0.65rem",
                              fontWeight: 500,
                              borderRadius: "10px",
                              px: 1,
                            }}
                          />
                        </Box>
                      </Box>
                      <Typography
                        sx={{
                          color: "#999",
                          fontSize: "0.65rem",
                          mt: 0.5,
                          minWidth: 50,
                          textAlign: "right",
                        }}
                      >
                        {log.time || ""}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 1, mb: 0.5 }} />
                </Box>
              </Slide>
            );
          })}
        </Stack>
      </Box>
    </Paper>
  );
}

export default LogHistory;
