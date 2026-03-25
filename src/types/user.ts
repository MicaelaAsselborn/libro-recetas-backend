import { UserRole } from "./auth";

export interface IUser {
	id: number;
	username: string;
	email: string;
	password: string;
	full_name?: string;
	role: UserRole;
	is_active: boolean;
	created_on: Date;
	updated_on: Date;
}
