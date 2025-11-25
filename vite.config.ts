import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['QUESTHELPER_HOST', 'QUESTHELPER_PORT', 'QSTH_BASE_URL', 'QSTH_ALLOWED_HOSTS']);

  const getPort = () => {
    const p = env.QUESTHELPER_PORT ?? process.env.QUESTHELPER_PORT;
    return p ? parseInt(p, 10) : 8082;
  };

  const getBase = () => {
    const b = env.QSTH_BASE_URL ?? process.env.QSTH_BASE_URL ?? '/';
    return b.endsWith('/') ? b : b + '/';
  };

  const getAllowedHosts = () => {
    const hosts = env.QSTH_ALLOWED_HOSTS ?? process.env.QSTH_ALLOWED_HOSTS ?? '*';
    return hosts === '*' ? true : hosts.split(',').map(h => h.trim());
  };

  return {
    base: getBase(),
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: env.QUESTHELPER_HOST ?? process.env.QUESTHELPER_HOST ?? '::',
      port: getPort(),
      allowedHosts: getAllowedHosts(),
    },
    envPrefix: 'QSTH_',
  };
});