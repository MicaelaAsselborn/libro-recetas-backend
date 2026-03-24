export interface JwtPayload {
	//jsonwebtoken Payload personalizado
	id: number;
	username: string;
	role: UserRole;
}

export enum UserRole {
	USER = "user",
	ADMIN = "admin",
}
