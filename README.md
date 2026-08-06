# FastCopy

빠르게 문구를 입력해 저장하고, 누구나 웹에서 바로 복사해서 붙여넣을 수 있는 공개 보드입니다.

## 기능

- 첫 화면에 가장 최근에 저장된 문구를 크게 노출
- 과거 저장 기록은 기본적으로 숨김 처리하고 펼쳐서 확인
- 다른 새로운 내용 입력하기 버튼으로 새 문구 저장
- Vercel 환경에서는 GitHub 저장소의 data/snippets.json 파일을 직접 업데이트해서 데이터 유지
- Material UI 기반 레이아웃 사용
- Flaticon 아이콘 사용 및 출처 표기 포함

## 기술 구성

- Next.js App Router
- React
- Material UI
- GitHub Contents API를 이용한 JSON 저장
- Vercel 배포 대상

## 로컬 실행

```bash
npm install
npm run dev
```

기본값으로는 저장소 내부의 data/snippets.json 파일을 읽고, 로컬 개발 환경에서는 해당 파일에 직접 저장합니다.

## Vercel 배포 전 환경 변수

Vercel 프로젝트에 아래 환경 변수를 설정하세요.

```bash
GITHUB_TOKEN=github_pat_xxx
GITHUB_OWNER=your-github-name-or-org
GITHUB_REPO=fastcopy
GITHUB_BRANCH=main
```

조건:

- GITHUB_TOKEN은 해당 저장소에 contents:write 권한이 있어야 합니다.
- GITHUB_REPO는 이 프로젝트가 들어 있는 저장소 이름이어야 합니다.
- 저장 대상 파일은 data/snippets.json 입니다.

## 배포 흐름

1. 이 저장소를 GitHub에 push 합니다.
2. Vercel에서 GitHub 저장소를 연결해 프로젝트를 import 합니다.
3. 위 환경 변수를 Vercel에 등록합니다.
4. 이후 GitHub에 코드가 push될 때마다 Vercel이 자동 배포합니다.
5. 서비스에서 새 문구를 저장하면 API가 GitHub 저장소의 data/snippets.json 파일을 바로 갱신합니다.

즉, 코드 배포는 GitHub -> Vercel 자동 배포 흐름이고, 서비스 데이터 저장은 Vercel 서버 라우트 -> GitHub 파일 업데이트 흐름입니다.

## Flaticon 아이콘 출처

- Copy icon: https://www.flaticon.com/free-icon/copy_1621635
- Edit icon: https://www.flaticon.com/free-icon/edit_1159633

Flaticon 무료 라이선스를 사용하는 경우 출처 표기를 유지해야 합니다.
