import { createContext } from "react";
import type { AppAbility } from "./abilities";

// Create context for ability
export const AbilityContext = createContext<AppAbility | null>(null);
