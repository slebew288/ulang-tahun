export interface PhotoData {
  url: string;
  title: string;
}

export interface AppData {
  message: string;
  photos: PhotoData[];
  captions: string[];
  video: string;
  sounds: {
    background: string;
    birthday: string;
    click: string;
    photoprint: string;
    photo: string;
  };
}

export type Step = 'menu' | 'text' | 'photo' | 'video' | 'birthday';