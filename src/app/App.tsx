import { RouterProvider } from 'react-router';
import { router } from './router';
/** 라우터 연결 */
export function App() {
  return <RouterProvider router={router} />;
}
