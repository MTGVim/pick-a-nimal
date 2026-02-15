# Pick-A-nimal

<kbd><img width="280" alt="image" src="https://github.com/user-attachments/assets/82ff4cef-cfe9-49a8-8679-38505bdc11ef" /></kbd>

[https://mtgvim.github.io/pick-a-nimal/](https://mtgvim.github.io/pick-a-nimal/)

브라우저에서 즐기는 동물 카드 매칭 게임입니다.  
기록은 서버 없이 브라우저 `localStorage`에 저장됩니다.

Node.js `20.19.0+`가 필요합니다 (`.nvmrc` 참고).

## 기술 스택
- Astro 5
- Vue 3
- TypeScript
- `@vite-pwa/astro` (Workbox)
- `localStorage` 기반 리더보드

## 로컬 개발
```sh
yarn install
yarn dev
```

## 검증
```sh
yarn astro check
yarn build
```

## 배포
- `main` 브랜치 푸시 시 GitHub Actions가 GitHub Pages로 자동 배포합니다.
- 배포 워크플로우: `.github/workflows/deploy-github-pages.yml`
- PR 빌드 체크: `.github/workflows/pr-check.yml`

## 주요 기능
- 쉬움(4x4), 어려움(4x6) 모드
- 동물 이모지 카드 프리셋 랜덤 선택
- 라운드 기록 저장 (소요 시간/뒤집기 횟수)
- 로컬 리더보드 페이지
- 기록 공유 문구 복사
- PWA 설치 및 오프라인 실행 지원

## 기여

Pick-A-nimal에 기여하고 싶다면, GitHub 저장소를 포크하고 풀 리퀘스트를 제출해 주세요.

GitHub 저장소: https://github.com/MTGVim/pick-a-nimal

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://nara.dev"><img src="https://avatars.githubusercontent.com/u/16604401?v=4?s=100" width="100px;" alt="nara"/><br /><sub><b>nara</b></sub></a><br /><a href="#ideas-narashin" title="Ideas, Planning, & Feedback">🤔</a> <a href="#userTesting-narashin" title="User Testing">📓</a> <a href="https://github.com/MTGVim/pick-a-nimal/issues?q=author%3Anarashin" title="Bug reports">🐛</a> <a href="#mentoring-narashin" title="Mentoring">🧑‍🏫</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://tigeryoo-portfolio.web.app/"><img src="https://avatars.githubusercontent.com/u/6271133?v=4?s=100" width="100px;" alt="TigerYoo"/><br /><sub><b>TigerYoo</b></sub></a><br /><a href="https://github.com/MTGVim/pick-a-nimal/commits?author=MTGVim" title="Code">💻</a> <a href="https://github.com/MTGVim/pick-a-nimal/commits?author=MTGVim" title="Documentation">📖</a> <a href="#design-MTGVim" title="Design">🎨</a> <a href="#maintenance-MTGVim" title="Maintenance">🚧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://clarekang.me"><img src="https://avatars.githubusercontent.com/u/17075926?v=4?s=100" width="100px;" alt="Clare Kang"/><br /><sub><b>Clare Kang</b></sub></a><br /><a href="#design-clarekang" title="Design">🎨</a> <a href="#ideas-clarekang" title="Ideas, Planning, & Feedback">🤔</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
