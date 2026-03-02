import { LucideIcon } from "lucide-react";

export interface Principle {
    id: string;
    title: string;
    icon: LucideIcon;
    intro: string;
    full: string;
    points: string[];
}

export interface Tension {
    id: string;
    title: string;
    desc: string;
    left: string;
    leftDesc: string;
    right: string;
    rightDesc: string;
}

export interface Model4DItem {
    id: string;
    name: string;
    subtitle: string;
    desc: string;
    icon: LucideIcon;
    details: string[];
}

export interface DelegationExample {
    subject: string;
    activity: string;
}

export interface DelegationLevel {
    lv: number;
    name: string;
    sub: string;
    human: number;
    ia: number;
    desc: string;
    examples: DelegationExample[];
}

export interface VoteType {
    id: string;
    label: string;
    color: string;
    icon: LucideIcon;
}

export interface NavLink {
    name: string;
    id: string;
}

export interface DashboardSection {
    id: string;
    name: string;
    items: string[];
}

export interface ParticipationSubItem {
    id: string;
    name: string;
}

export interface ParticipationSection {
    id: string;
    name: string;
    items: ParticipationSubItem[];
}
