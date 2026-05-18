export type Gender = 'MALE' | 'FEMALE'
export type EnglishLevel = 'HIGH' | 'MIDDLE' | 'LOW'
export type UserRole = 'MEMBER' | 'ADMIN'

export interface Profile {
  id: string
  name: string | null
  gender: Gender | null
  english_level: EnglishLevel | null
  role: UserRole
  is_onboarded: boolean
  created_at: string
}

export interface Session {
  id: string
  name: string
  created_at: string
  created_by: string
}

export interface SeatAssignment {
  id: string
  session_id: string
  user_id: string
  team_number: number
}

export interface SeatAssignmentWithProfile extends SeatAssignment {
  profiles: Pick<Profile, 'id' | 'name' | 'gender' | 'english_level'>
}
