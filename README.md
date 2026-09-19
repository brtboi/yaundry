# Yaundry

A laundry app for Yale residential colleges. See which washers and dryers are free, ping people
to pick up their finished laundry, rate machines and the last person who used them, and post in a
shared lost & found.

Built with [Expo](https://expo.dev) (SDK 57), Expo Router and React Native. It runs on iOS,
Android and the web. It's a prototype right now: all data is mock data, and there's no backend
or login.

## Quick setup

You need [Node.js](https://nodejs.org) 20 or newer and npm.

```bash
git clone https://github.com/brtboi/yaundry.git
cd yaundry
npm install
npm run start:tunnel
```

Then open the app:

- **Phone:** install [Expo Go](https://expo.dev/go) and scan the QR code in the terminal. Your
  phone and computer need to be on the same Wi-Fi. If they can't reach each other (campus Wi-Fi
  often blocks this), run `npm run start:tunnel` instead.
- **Web:** press `w` in the terminal, or run `npm run web`.
- **Simulator:** press `i` for the iOS Simulator (macOS with Xcode) or `a` for an Android emulator.

## Scripts

| Command                 | What it does                                          |
| ----------------------- | ----------------------------------------------------- |
| `npm start`             | Start the Expo dev server                             |
| `npm run start:tunnel`  | Same, through a tunnel, for phones on another network |
| `npm run web`           | Start and open in the browser                         |
| `npm run ios` / `android` | Start and open in a simulator/emulator              |
| `npm run lint`          | Lint with ESLint                                      |
| `npx tsc --noEmit`      | Type-check                                            |

## Project layout

```
src/
  app/                 Screens (file-based routing with Expo Router)
    index.tsx          Sign-in
    booking.tsx        Pick your residential college (map + list)
    machine-reviews.tsx
    home/              Tabbed screens: home, lost & found, leaderboard, support, profile
  components/          Shared UI: modals, bottom sheets, icons, tabs
  constants/theme.ts   Colors (light + dark), spacing, fonts
  hooks/               Theme, selected college, machine reviews
assets/images/         App icons, illustrations, college shields
```
