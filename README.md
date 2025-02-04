# Pick-A-nimal

<kbd><img width="280" alt="image" src="https://github.com/user-attachments/assets/82ff4cef-cfe9-49a8-8679-38505bdc11ef" /></kbd>

[https://mtgvim.github.io/pick-a-nimal/](https://mtgvim.github.io/pick-a-nimal/)

```sh
yarn install && yarn dev
```

Node.js `20.19.0+`가 필요합니다 (`.nvmrc` 참고).

## 스택
- astro
- vue.js 3
- localStorage
- @vite-pwa/astro (Workbox)

## 소개

카드 매칭 게임의 웹 버전입니다.
현재는 온라인 계정 연동 없이, 브라우저 로컬 저장소(LocalStorage)에 기록을 저장합니다.

## 현재 동작
- 게임 클리어 시 소요 시간/뒤집기 횟수를 로컬에 저장
- 리더보드는 현재 브라우저 기준 상위 기록 표시
- 승리 시 `ta-da.mp3` 재생
- PWA 설치 및 오프라인 실행 지원 (Workbox)

## TO-DO
- [x] 기본 메커니즘 📆 25.01.07
- [x] 재시작 기능 📆 25.01.07
- [x] 애니메이션 📆 25.01.07
- [x] 최고기록 저장 (시간, 뒤집기 갯수) 📆 25.01.07
- [x] 오프라인 로컬 저장소 기반 기록 연동 📆 26.02.15
- [x] 공유하기 📆 25.01.07
  - [x] 클립보드 📆 25.01.07
- [x] 로컬 리더보드 📆 26.02.15
- [x] PWA (앱으로 설치) 지원 📆 26.02.15
- [ ] 닉네임 편집 기능 (로컬)
- [ ] flip 속도조절
- [ ] 배속 정보 기록 반영

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
