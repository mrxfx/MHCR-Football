import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "./firebase";

export interface Team {
  id?: string;
  name: string;
  coach: string;
  stadium: string;
  founded: string;
  active: boolean;
  logo: string;
}

export interface Player {
  id?: string;
  name: string;
  team: string; // team id or name
  position: string;
  number: string;
  goals: number;
  image: string;
}

export interface Match {
  id?: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: "upcoming" | "live" | "finished";
  date: string;
}

export interface Standing {
  id?: string;
  team: string; // team id or name
  played: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
}

export interface News {
  id?: string;
  title: string;
  description: string;
  image: string;
  date: string;
}

export interface Settings {
  id?: string;
  appName: string;
  logoUrl: string;
  themeColor: string;
}

export interface GoalScorer {
  id?: string;
  matchId?: string;
  teamId: string;
  playerName: string;
  goals: number;
  minute?: string;
}

// Helpers
export const collections = {
  teams: collection(db, "teams"),
  players: collection(db, "players"),
  matches: collection(db, "matches"),
  standings: collection(db, "standings"),
  news: collection(db, "news"),
  settings: collection(db, "settings"),
  admins: collection(db, "admins"),
  goalScorers: collection(db, "goalScorers"),
};
