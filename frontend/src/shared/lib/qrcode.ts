import QRCode from 'qrcode';

interface QRCodeParams {
  Margin: number;
  Background: string;
  Finder: string;
  Horizontal: string;
  Vertical: string;
  Cross: string;
  'Horizontal thickness': number;
  'Vertical thickness': number;
  'Cross thickness': number;
}

export async function createQRCode(
  url: string,
  params: QRCodeParams,
  logoUrl: string
): Promise<string> {
  try {
    const qrSvg = await QRCode.toString(url, {
      type: 'svg',
      color: {
        dark: params.Finder,
        light: params.Background,
      },
      margin: params.Margin,
      width: 200,
      errorCorrectionLevel: 'H', // 높은 오류 수정 레벨 사용
    });

    // SVG 파싱
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(qrSvg, 'image/svg+xml');
    const svgElement = svgDoc.documentElement;

    // viewBox 속성 가져오기
    const viewBox = svgElement.getAttribute('viewBox');
    const [, , width, height] = viewBox?.split(' ').map(Number) || [0, 0, 0, 0];

    // 로고 크기 및 위치 계산
    const logoSize = Math.min(width, height) * 0.2; // QR 코드 크기의 20%
    const logoX = (width - logoSize) / 2;
    const logoY = (height - logoSize) / 2;

    // 로고 이미지 요소 생성
    const logoImage = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'image'
    );
    logoImage.setAttribute('href', logoUrl);
    logoImage.setAttribute('x', logoX.toString());
    logoImage.setAttribute('y', logoY.toString());
    logoImage.setAttribute('width', logoSize.toString());
    logoImage.setAttribute('height', logoSize.toString());

    // 로고 배경 (흰색 원) 생성
    const logoBackground = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'circle'
    );
    logoBackground.setAttribute('cx', (width / 2).toString());
    logoBackground.setAttribute('cy', (height / 2).toString());
    logoBackground.setAttribute('r', (logoSize / 2 + 2).toString());
    logoBackground.setAttribute('fill', 'white');

    // SVG에 로고 배경과 이미지 추가
    svgElement.appendChild(logoBackground);
    svgElement.appendChild(logoImage);

    // 수정된 SVG를 문자열로 변환
    const serializer = new XMLSerializer();
    const modifiedSvg = serializer.serializeToString(svgDoc);

    return modifiedSvg;
  } catch (err) {
    console.error('QR 코드 생성 중 오류 발생:', err);
    return '';
  }
}
