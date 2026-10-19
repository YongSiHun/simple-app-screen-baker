import { RouterProvider } from 'react-router';
import { router } from './router';
/**
 * 앱의 라우터를 화면에 연결합니다.
 */
export function App() {
  return <RouterProvider router={router} />;
}
