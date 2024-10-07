import { useEffect } from 'react';
import { router } from './AppRouter';
import { Providers } from './providers';
import { queryClient } from '../shared/query/query-client';

const App = () => {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
     // 명시적으로 배경색과 텍스트 색상 설정
    document.body.style.backgroundColor = '#FFF0E6';
    document.body.style.color = '#333333';
  }, []);

  return (
    <div className="bg-background text-text">
      <Providers router={router} client={queryClient} />
    </div>
  );
};

export default App;
