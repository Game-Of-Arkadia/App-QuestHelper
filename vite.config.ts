import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['QUESTHELPER_HOST', 'QUESTHELPER_PORT']);

  const getPort = () => {
    const p = env.QUESTHELPER_PORT ?? process.env.QUESTHELPER_PORT;
    return p ? parseInt(p, 10) : 8082;
  };

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: env.QUESTHELPER_HOST ?? process.env.QUESTHELPER_HOST ?? '::',
      port: getPort(),
      strictPort: true,
    },
    envPrefix: 'QSTH_',
  };
});