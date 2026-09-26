import avatar1Male from '../assets/avatars/avatar_1_male.jpg';
import avatar1Female from '../assets/avatars/avatar_1_female.jpg';
import avatar2Male from '../assets/avatars/avatar_2_male.jpg';
import avatar2Female from '../assets/avatars/avatar_2_female.jpg';
import avatar3Male from '../assets/avatars/avatar_3_male.jpg';
import avatar3Female from '../assets/avatars/avatar_3_female.jpg';
import avatar4Male from '../assets/avatars/avatar_4_male.jpg';
import avatar4Female from '../assets/avatars/avatar_4_female.jpg';
import avatar5Male from '../assets/avatars/avatar_5_male.jpg';
import avatar5Female from '../assets/avatars/avatar_5_female.jpg';
import avatar6Male from '../assets/avatars/avatar_6_male.jpg';
import avatar6Female from '../assets/avatars/avatar_6_female.jpg';

export interface AvatarItem {
  id: string;
  name: string;
  gender: 'male' | 'female';
  pair: number;
  src: string;
}

export const PRESET_AVATARS: AvatarItem[] = [
  // Pair 1
  { id: 'avatar-1-male', name: 'Student 1 (Male)', gender: 'male', pair: 1, src: avatar1Male },
  { id: 'avatar-1-female', name: 'Student 1 (Female)', gender: 'female', pair: 1, src: avatar1Female },
  // Pair 2
  { id: 'avatar-2-male', name: 'Student 2 (Male)', gender: 'male', pair: 2, src: avatar2Male },
  { id: 'avatar-2-female', name: 'Student 2 (Female)', gender: 'female', pair: 2, src: avatar2Female },
  // Pair 3
  { id: 'avatar-3-male', name: 'Student 3 (Male)', gender: 'male', pair: 3, src: avatar3Male },
  { id: 'avatar-3-female', name: 'Student 3 (Female)', gender: 'female', pair: 3, src: avatar3Female },
  // Pair 4
  { id: 'avatar-4-male', name: 'Student 4 (Male)', gender: 'male', pair: 4, src: avatar4Male },
  { id: 'avatar-4-female', name: 'Student 4 (Female)', gender: 'female', pair: 4, src: avatar4Female },
  // Pair 5
  { id: 'avatar-5-male', name: 'Student 5 (Male)', gender: 'male', pair: 5, src: avatar5Male },
  { id: 'avatar-5-female', name: 'Student 5 (Female)', gender: 'female', pair: 5, src: avatar5Female },
  // Pair 6
  { id: 'avatar-6-male', name: 'Student 6 (Male)', gender: 'male', pair: 6, src: avatar6Male },
  { id: 'avatar-6-female', name: 'Student 6 (Female)', gender: 'female', pair: 6, src: avatar6Female },
];

export const getRandomAvatar = (gender?: 'male' | 'female'): string => {
  const eligible = gender
    ? PRESET_AVATARS.filter((a) => a.gender === gender)
    : PRESET_AVATARS;
  const randomIndex = Math.floor(Math.random() * eligible.length);
  return eligible[randomIndex].src;
};

export const isPresetAvatar = (url?: string): boolean => {
  if (!url) return false;
  return PRESET_AVATARS.some((a) => a.src === url);
};
