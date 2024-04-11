import { Entity } from "./entity.js";

export interface Training extends Entity {
    title: string;
    description: string;
    duration: number;
    intensity: number;

    exercises: Exercise[];  // Array von Übungen}  
} 

export interface Exercise {
            id: string;
            name: string;
            description: string;
            duration: number; 
            image?: string;
        }
        