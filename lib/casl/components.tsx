import type { ReactNode } from "react";
import { AbilityContext } from "./context";
import { type AbilityProviderProps, useAbility } from "./hooks";

// Provider component
export function AbilityProvider({ children, ability }: AbilityProviderProps) {
	return (
		<AbilityContext.Provider value={ability || null}>
			{children}
		</AbilityContext.Provider>
	);
}

// Higher-order component for conditional rendering
interface CanProps {
	I?: string; // action
	a?: string; // subject
	this?: any; // conditions
	children: ReactNode;
	fallback?: ReactNode;
}

export function Can({
	I,
	a,
	this: conditions,
	children,
	fallback = null,
}: CanProps) {
	const ability = useAbility();

	if (!I || !a || !ability) {
		return <>{fallback}</>;
	}

	const canDo = ability.can(I as any, a as any, conditions);

	return canDo ? children : fallback;
}
