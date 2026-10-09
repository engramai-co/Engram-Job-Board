import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "../styles.css";
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import './workspace.css';
import { UIProvider } from './ui';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UIProvider><App /></UIProvider>
  </StrictMode>
);
