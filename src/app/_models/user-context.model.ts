export interface Team {
  teamId: string;
  teamName: string;
  teamRoles?: number;
  createdAt?: string;
  modifiedAt?: string;
}

export interface UserContext {
  userId: string;
  firstName: string;
  lastName: string;
  userEmail: string;
  phone?: string;
  passwordHash?: string;
  passwordSalt?: string;
  isLocked?: boolean;
  createdAt?: string;
  modifiedAt?: string;
  teams: Team[];
  currentTeamId?: string;
}
