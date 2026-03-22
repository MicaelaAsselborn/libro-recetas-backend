export interface JwtPayload {
	//jsonwebtoken Payload personalizado
	id: string;
	username: string;
	role: UserRole;
}

export enum UserRole {
	USER = "user",
	ADMIN = "admin",
}
