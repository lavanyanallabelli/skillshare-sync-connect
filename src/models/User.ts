
// User model definition
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  bio?: string;
  location?: string;
  occupation?: string;
  education?: string;
  avatar?: string;
  headline?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  teachingSkills: Skill[];
  learningSkills: Skill[];
  experiences: Experience[];
  educations: Education[];
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
}

export interface Skill {
  id?: string;
  skill: string;
  proficiencyLevel?: string;
}
