import { collection } from "firebase/firestore";
import { db } from "./firebase";

export const collections = {
  teams: collection(db, "teams"),
  players: collection(db, "players"),
  matches: collection(db, "matches"),
  standings: collection(db, "standings"),
  news: collection(db, "news"),
  settings: collection(db, "settings"),
};

export interface Team {
  id: string;
  name: string;
  coach: string;
  stadium: string;
  founded: string;
  active: boolean;
  logo: string;
}

export interface Player {
  id: string;
  name: string;
  team: string;
  position: string;
  number: string;
  goals: number;
  image: string;
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: "live" | "upcoming" | "finished";
  live?: boolean;
  date: string;
}

export interface Standing {
  id: string;
  team: string;
  played: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
}

export interface News {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
}

export interface Settings {
  id: string;
  appName: string;
  logoUrl: string;
  themeColor: string;
}
