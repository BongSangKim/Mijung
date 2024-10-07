import { useRouteError, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaRedo } from 'react-icons/fa';
import { Button } from './Button';

export const Error = () => {
  const error = useRouteError() as any;
  const navigate = useNavigate();

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const getErrorMessage = () => {
    if (error?.status === 404) {
      return "앗! 찾으시는 정보가 아직 준비되지 않았어요.\n가격이나 레시피 정보가 매핑되지 않은 경우일 수 있어요.";
    }
    return "음... 뭔가 잘못된 것 같아요.\n저희 요리사들이 열심히 고치고 있어요!";
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-background px-4 py-10 font-sans text-text-dark">
      <img src="/images/404.gif" alt="404 Error" className="w-32 h-32 mb-6" />
      <h1 className="text-4xl font-bold text-coral mb-6">미정<span className="text-2xl text-text-light">味定</span></h1>
      <h2 className="text-3xl font-bold mb-4 text-blueberry">오늘의 레시피, 아직 오븐에서 익는 중!</h2>
      <p className="text-xl text-center mb-8 max-w-2xl text-text-light whitespace-pre-line">
        {getErrorMessage()}
      </p>
      <p className="text-lg text-center mb-8 max-w-2xl text-text whitespace-pre-line">
        당황하지 마세요! 이런 일은 가끔 일어날 수 있어요.
        다른 레시피나 식재료에서 더 유용하고 맛있는 정보를 제공해드릴게요!
      </p>
      <div className="flex space-x-4">
        <Button 
          onClick={handleGoBack}
          variant="secondary"
          className="flex items-center"
        >
          <FaArrowLeft className="mr-2" />
          뒤로 가기
        </Button>
        <Button 
          onClick={handleReload}
          variant="primary"
          className="flex items-center"
        >
          <FaRedo className="mr-2" />
          다시 시도하기
        </Button>
      </div>
      <p className="mt-8 text-sm text-text-light">
        계속해서 문제가 발생한다면 <a href="mailto:support@mijung.com" className="text-coral hover:underline">고객센터</a>로 문의해 주세요.
      </p>
      {process.env.NODE_ENV === 'development' && error?.stack && (
        <div className="w-full max-w-4xl mt-12 bg-background-light rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-bold mb-4 text-blueberry">개발자를 위한 오류 정보:</h3>
          <div className="mb-6 text-text-dark">
            <p><strong>오류 유형:</strong> {error.name}</p>
            <p><strong>오류 메시지:</strong> {error.message}</p>
            {error.code && <p><strong>오류 코드:</strong> {error.code}</p>}
            {error.status && <p><strong>HTTP 상태:</strong> {error.status}</p>}
          </div>
          <div className="bg-background p-4 rounded-lg">
            <h4 className="text-lg font-semibold mb-2 text-mint">스택 트레이스:</h4>
            <pre className="text-sm text-text-light whitespace-pre-wrap break-words">
              {error.stack}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
