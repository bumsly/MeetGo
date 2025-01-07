import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // 절대 경로 설정 (import 시 '@/components/...' 형태로 사용 가능)
      "@": path.resolve(__dirname, "src"),
    },
  },
});
