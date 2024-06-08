
# 크롬 확장 프로그램으로 Upbit 시세 확인하기

React와 Socket 통신을 통해 upbit에서 실시간 시세를 조회하고 업데이트 합니다. 크롬 확장 프로그램으로 이용하려고 만들었습니다.
실제 크롬스토어에는 업로드 되어있지 않지만, 빌드 후 업로드시 사용가능합니다.

## 기능

- 실시간 암호화폐 가격
- 즐겨찾기 코인 필터
- 한국어 이름으로 검색

## 스크린샷

<div style="display: flex; flex-wrap: wrap;">
  <div style="flex: 1; display: flex;">
    <img style="width: 40%" src="https://github.com/user-attachments/assets/0c0a407e-d117-45b7-a232-021972936159" width="100%">
    <img style="width: 40%" src="https://github.com/user-attachments/assets/ae4eeaa0-e05f-4fb9-b391-df6e8ab119a6" width="100%">
  </div>
  <div style="flex: 1;">
    <img style="width: 40%" src="https://github.com/user-attachments/assets/83a1db36-c026-48e5-b50c-487d31f9e0b9" width="100%">
  </div>
</div>

## 실행

1. 리포지토리를 클론합니다:
   ```sh
   git clone https://github.com/yourusername/coin-price-extension.git
   ```
2. 프로젝트 디렉토리로 이동합니다:
   ```sh
   cd coin-price-extension
   ```
3. 모듈을 설치합니다:
   ```sh
   npm install
   ```
4. 프로젝트를 빌드합니다:
   ```sh
   npm run build
   ```
5. 크롬에서 확장 프로그램을 로드합니다:
   - 크롬을 열고 `chrome://extensions/`로 이동합니다.
   - 오른쪽 상단에서 "개발자 모드"를 활성화합니다.
   - "압축 해제된 확장 프로그램 로드"를 클릭하고 프로젝트 디렉토리의 `build` 폴더를 선택합니다.

## 사용법

1. 크롬 툴바에서 확장 프로그램 아이콘을 클릭하여 팝업을 엽니다.
2. 검색창을 사용하여 코인의 한국어 이름을 검색합니다.
3. "즐겨찾기한 코인만 보기" 체크박스를 선택하여 즐겨찾기한 코인만 목록에 표시합니다.
4. 설정 아이콘을 클릭하여 즐겨찾기 코인을 관리합니다.

