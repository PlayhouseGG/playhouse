import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { themeSong } from "styles/sound";

export type UserPayload = {
  name: string;
};

export type CurrentAppState = {
  name: string;
  isMusicOn: boolean;
  isSFXOn: boolean;
  isDarkMode: boolean;
};

const getIsDarkMode = () => {
  const isDarkMode = localStorage.getItem("isDarkMode");
  if (isDarkMode === "true") return true;
  if (isDarkMode === "false") return false;
  if (window.matchMedia)
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  return true;
};

export const initialState: CurrentAppState = {
  name: localStorage.getItem("name") || "",
  isMusicOn: localStorage.getItem("isMusicOn") === "true",
  isSFXOn: localStorage.getItem("isSFXOn") === "true",
  isDarkMode: getIsDarkMode(),
};

const playhouseSlice = createSlice({
  name: "playhouse",
  initialState,
  reducers: {
    toggle_music: (state) => {
      state.isMusicOn = !state.isMusicOn;
      if (state.isMusicOn) {
        themeSong.play();
      } else {
        themeSong.pause();
      }
      localStorage.setItem("isMusicOn", state.isMusicOn.toString());
    },
    toggle_SFX: (state) => {
      state.isSFXOn = !state.isSFXOn;
      localStorage.setItem("isSFXOn", state.isSFXOn.toString());
    },
    toggle_dark_mode: (state) => {
      state.isDarkMode = !state.isDarkMode;
      localStorage.setItem("isDarkMode", state.isDarkMode.toString());
    },
    update_user: (state, { payload }: PayloadAction<UserPayload>) => {
      state.name = payload.name ?? state.name;
      if (state.name) localStorage.setItem("name", state.name);
    },
  },
});

export const playhouseActions = playhouseSlice.actions;
export const playhouseReducer = playhouseSlice.reducer;
