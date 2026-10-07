import "@picocss/pico/css/pico.min.css";
import "@fontsource/roboto";
import "@fontsource/audiowide";
import "@fontsource/anonymous-pro";
import "./core/styles/theme.css";
import "./core/styles/colors.css";
import "./core/styles/custom.css";
import { composeApplication } from "./app.compose.ts";

void composeApplication();
import "./core/styles/layout.css";
import "./core/styles/records.css";
